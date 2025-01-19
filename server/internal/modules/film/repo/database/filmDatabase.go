package database

import (
	"errors"
	"gorm.io/gorm"
	"log/slog"
	"server/internal/modules/actor"
	f "server/internal/modules/film"
	g "server/internal/modules/genre"
)

type FilmDatabase struct {
	db  *gorm.DB
	log *slog.Logger
}

func NewFilmDatabase(db *gorm.DB, log *slog.Logger) *FilmDatabase {
	return &FilmDatabase{
		db:  db,
		log: log,
	}
}

func (db *FilmDatabase) GetFilmByID(id uint) (*f.FilmDTO, error) {
	var film f.Film
	if err := db.db.Preload("Genres").Preload("Actors").First(&film, id).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, f.ErrFilmNotFound
		}
		db.log.Error("failed to get film by FilmId", "error", err, "id", id)
		return nil, f.ErrInternal
	}

	var stats f.FilmStatsModel
	if err := db.db.Model(&f.FilmStatsModel{}).Where("film_id = ?", id).First(&stats).Error; err != nil {
		db.log.Error("failed to get film stats", "error", err, "id", id)
		return nil, f.ErrInternal
	}

	filmDTO := film.ToDTO(&stats)

	// Загрузка жанров и актеров
	if len(filmDTO.GenreIDs) > 0 {
		var genres []g.Genre
		if err := db.db.Where("id IN ?", filmDTO.GenreIDs).Find(&genres).Error; err != nil {
			return nil, err
		}
		for _, genre := range genres {
			gen := g.ToDTO(&genre)
			filmDTO.Genres = append(filmDTO.Genres, *gen)
		}
	}

	if len(filmDTO.ActorIDs) > 0 {
		var actors []actor.Actor
		if err := db.db.Where("id IN ?", filmDTO.ActorIDs).Find(&actors).Error; err != nil {
			return nil, err
		}
		for _, act := range actors {
			actor := actor.ToDTO(&act)
			filmDTO.Actors = append(filmDTO.Actors, *actor)
		}
	}

	return filmDTO, nil
}

func (db *FilmDatabase) CreateFilm(film *f.FilmDTO) (uint, error) {
	filmModel, _ := film.ToModel()

	// Start a transaction
	tx := db.db.Begin()
	defer func() {
		if r := recover(); r != nil {
			tx.Rollback()
		}
	}()

	// Debug: Log the film model before creation
	db.log.Debug("film model before creation", "film", filmModel)

	// Create the Film record without automatically creating associations
	if err := tx.Omit("Genres", "Actors").Create(filmModel).Error; err != nil {
		tx.Rollback()
		if errors.Is(err, gorm.ErrDuplicatedKey) {
			return 0, f.ErrFilmAlreadyExists
		}
		db.log.Error("failed to create film", "error", err, "film", film)
		return 0, f.ErrInternal
	}

	// Debug: Log the film model after creation
	db.log.Debug("film model after creation", "filmID", filmModel.FilmId, "film", filmModel)

	// Set FilmID for Genres and Actors
	for i := range filmModel.Genres {
		filmModel.Genres[i].FilmID = filmModel.FilmId
	}
	for i := range filmModel.Actors {
		filmModel.Actors[i].FilmID = filmModel.FilmId
	}

	// Debug: Log the genres and actors after setting FilmID
	db.log.Debug("film genres after setting FilmID", "genres", filmModel.Genres)
	db.log.Debug("film actors after setting FilmID", "actors", filmModel.Actors)

	// Create associated FilmGenre records
	if len(filmModel.Genres) > 0 {
		if err := tx.Create(&filmModel.Genres).Error; err != nil {
			tx.Rollback()
			db.log.Error("failed to create film genres", "error", err, "film", film)
			return 0, f.ErrGenreNotFound
		}
	}

	// Create associated FilmActor records
	if len(filmModel.Actors) > 0 {
		if err := tx.Create(&filmModel.Actors).Error; err != nil {
			tx.Rollback()
			db.log.Error("failed to create film actors", "error", err, "film", film)
			return 0, f.ErrActorNotFound
		}
	}

	// Commit the transaction
	if err := tx.Commit().Error; err != nil {
		tx.Rollback()
		db.log.Error("failed to commit transaction", "error", err, "film", film)
		return 0, f.ErrInternal
	}

	return filmModel.FilmId, nil
}

func (db *FilmDatabase) UpdateFilm(film *f.FilmDTO) error {
	filmModel, _ := film.ToModel()

	// Start a transaction
	tx := db.db.Begin()
	defer func() {
		if r := recover(); r != nil {
			tx.Rollback()
		}
	}()

	// Update the Film record
	if err := tx.Model(&f.Film{}).Where("film_id = ?", film.ID).Updates(filmModel).Error; err != nil {
		tx.Rollback()
		db.log.Error("failed to update film", "error", err, "film", film)
		return f.ErrInternal
	}

	// Update Genres
	if len(film.Genres) > 0 {
		// Delete existing genres for the film
		if err := tx.Where("film_id = ?", film.ID).Delete(&f.FilmGenre{}).Error; err != nil {
			tx.Rollback()
			db.log.Error("failed to delete existing genres", "error", err, "filmID", film.ID)
			return f.ErrInternal
		}

		// Add new genres
		for _, genre := range filmModel.Genres {
			genre.FilmID = film.ID // Ensure FilmID is set
			if err := tx.Create(&genre).Error; err != nil {
				tx.Rollback()
				db.log.Error("failed to add genre to film", "error", err, "filmID", film.ID, "genreID", genre.GenreID)
				return f.ErrInternal
			}
		}
	}

	// Update Actors
	if len(film.Actors) > 0 {
		// Delete existing actors for the film
		if err := tx.Where("film_id = ?", film.ID).Delete(&f.FilmActor{}).Error; err != nil {
			tx.Rollback()
			db.log.Error("failed to delete existing actors", "error", err, "filmID", film.ID)
			return f.ErrInternal
		}

		// Add new actors
		for _, actor := range filmModel.Actors {
			actor.FilmID = film.ID // Ensure FilmID is set
			if err := tx.Create(&actor).Error; err != nil {
				tx.Rollback()
				db.log.Error("failed to add actor to film", "error", err, "filmID", film.ID, "actorID", actor.ActorID)
				return f.ErrInternal
			}
		}
	}

	// Commit the transaction
	if err := tx.Commit().Error; err != nil {
		tx.Rollback()
		db.log.Error("failed to commit transaction", "error", err, "film", film)
		return f.ErrInternal
	}

	return nil
}

func (db *FilmDatabase) DeleteFilm(id uint) error {
	result := db.db.Delete(&f.Film{}, id)
	if result.Error != nil {
		db.log.Error("failed to delete film", "error", result.Error, "id", id)
		return f.ErrInternal
	}
	if result.RowsAffected == 0 {
		return f.ErrFilmNotFound
	}
	return nil
}

func (db *FilmDatabase) GetFilms(filters f.FilmFilters, sort f.FilmSort) ([]*f.FilmDTO, error) {
	query := db.db.Model(&f.Film{}).Joins("LEFT JOIN film_stats ON film_stats.film_id = films.film_id")

	if len(filters.GenreIDs) > 0 {
		query = query.Joins("JOIN film_genre ON film_genre.film_id = films.id").
			Where("film_genre.genre_id IN ?", filters.GenreIDs)
	}
	if len(filters.ActorIDs) > 0 {
		query = query.Joins("JOIN film_actor ON film_actor.film_id = films.id").
			Where("film_actor.actor_id IN ?", filters.ActorIDs)
	}
	if filters.Producer != "" {
		query = query.Where("producer = ?", filters.Producer)
	}
	if filters.MinRating > 0 {
		query = query.Where("film_stats.avg_rating >= ?", filters.MinRating)
	}
	if filters.MaxRating > 0 {
		query = query.Where("film_stats.avg_rating <= ?", filters.MaxRating)
	}
	if !filters.MinDate.IsZero() {
		query = query.Where("release_date >= ?", filters.MinDate)
	}
	if !filters.MaxDate.IsZero() {
		query = query.Where("release_date <= ?", filters.MaxDate)
	}
	if filters.MinDuration > 0 {
		query = query.Where("runtime >= ?", filters.MinDuration)
	}
	if filters.MaxDuration > 0 {
		query = query.Where("runtime <= ?", filters.MaxDuration)
	}

	if sort.By != "" {
		order := sort.By
		if sort.Order != "" {
			order += " " + sort.Order
		}
		query = query.Order(order)
	}

	if filters.Page > 0 && filters.PageSize > 0 {
		offset := (filters.Page - 1) * filters.PageSize
		query = query.Offset(offset).Limit(filters.PageSize)
	}

	var films []*f.Film
	if err := query.Find(&films).Error; err != nil {
		db.log.Error("failed to get films", "error", err, "filters", filters, "sort", sort)
		return nil, f.ErrInternal
	}

	var filmDTOs []*f.FilmDTO
	for _, film := range films {
		var stats f.FilmStatsModel
		if err := db.db.Model(&f.FilmStatsModel{}).Where("film_id = ?", film.FilmId).First(&stats).Error; err != nil {
			db.log.Error("failed to get film stats", "error", err, "filmID", film.FilmId)
			return nil, f.ErrInternal
		}

		filmDTO := film.ToDTO(&stats)
		for _, genre := range film.Genres {
			filmDTO.GenreIDs = append(filmDTO.GenreIDs, genre.GenreID)
		}
		for _, actor := range film.Actors {
			filmDTO.ActorIDs = append(filmDTO.ActorIDs, actor.ActorID)
		}

		filmDTOs = append(filmDTOs, filmDTO)
	}

	return filmDTOs, nil
}
