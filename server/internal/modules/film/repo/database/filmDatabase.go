package database

import (
	"errors"
	"gorm.io/gorm"
	"log/slog"
	f "server/internal/modules/film"
	"fmt"
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

	// Create the Film record with associations
	if err := tx.Create(filmModel).Error; err != nil {
		tx.Rollback()
		if errors.Is(err, gorm.ErrDuplicatedKey) {
			return 0, f.ErrFilmAlreadyExists
		}
		db.log.Error("failed to create film", "error", err, "film", film)
		return 0, f.ErrInternal
	}

	// Debug: Log the film model after creation
	db.log.Debug("film model after creation", "filmID", filmModel.FilmId, "film", filmModel)

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
	if len(filmModel.Genres) > 0 {
		// Replace existing genres for the film
		if err := tx.Model(&filmModel).Association("Genres").Replace(filmModel.Genres); err != nil {
			tx.Rollback()
			db.log.Error("failed to update film genres", "error", err, "filmID", film.ID)
			return f.ErrInternal
		}
	}

	// Update Actors
	if len(filmModel.Actors) > 0 {
		// Replace existing actors for the film
		if err := tx.Model(&filmModel).Association("Actors").Replace(filmModel.Actors); err != nil {
			tx.Rollback()
			db.log.Error("failed to update film actors", "error", err, "filmID", film.ID)
			return f.ErrInternal
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
    query := db.db.Model(&f.Film{}).
        Select("films.film_id, films.*, film_stats.avg_rating").
        Joins("LEFT JOIN film_stats ON film_stats.film_id = films.film_id")

    // Фильтрация по жанрам (все указанные жанры должны быть у фильма)
    if len(filters.GenreIDs) > 0 {
        for _, genreID := range filters.GenreIDs {
            alias := fmt.Sprintf("fg%d", genreID) // Уникальный алиас для каждого JOIN
            query = query.Joins(
                fmt.Sprintf("JOIN film_genre AS %s ON %s.film_id = films.film_id AND %s.genre_id = %d",
                    alias, alias, alias, genreID),
            )
        }
    }

    // Фильтрация по актерам (все указанные актеры должны быть у фильма)
    if len(filters.ActorIDs) > 0 {
        for _, actorID := range filters.ActorIDs {
            alias := fmt.Sprintf("fa%d", actorID) // Уникальный алиас для каждого JOIN
            query = query.Joins(
                fmt.Sprintf("JOIN film_actor AS %s ON %s.film_id = films.film_id AND %s.actor_id = %d",
                    alias, alias, alias, actorID),
            )
        }
    }

    // Остальные фильтры
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
    if f.DurationStringToMinutes(filters.MinDuration) > 0 {
        query = query.Where("runtime >= ?", f.DurationStringToMinutes(filters.MinDuration))
    }
    if f.DurationStringToMinutes(filters.MaxDuration) > 0 {
        query = query.Where("runtime <= ?", f.DurationStringToMinutes(filters.MaxDuration))
    }

    // Сортировка
    if sort.By != "" {
        order := sort.By
        if sort.Order != "" {
            order += " " + sort.Order
        }
        query = query.Order(order)
    }

    // Пагинация
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
