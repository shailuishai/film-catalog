package database

import (
	"errors"
	"gorm.io/gorm"
	"log/slog"
	f "server/internal/modules/film"
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
	var film f.FilmDTO
	if err := db.db.First(&film, id).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, f.ErrFilmNotFound
		}
		db.log.Error("failed to get film by ID", "error", err, "id", id)
		return nil, f.ErrInternal
	}
	return &film, nil
}

func (db *FilmDatabase) CreateFilm(film *f.FilmDTO) error {
	if err := db.db.Create(film).Error; err != nil {
		if errors.Is(err, gorm.ErrDuplicatedKey) {
			return f.ErrFilmAlreadyExists
		}
		db.log.Error("failed to create film", "error", err, "film", film)
		return f.ErrInternal
	}
	return nil
}

func (db *FilmDatabase) UpdateFilm(film *f.FilmDTO) error {
	result := db.db.Model(&f.FilmDTO{}).Where("id = ?", film.ID).Updates(film)
	if result.Error != nil {
		db.log.Error("failed to update film", "error", result.Error, "film", film)
		return f.ErrInternal
	}
	if result.RowsAffected == 0 {
		return f.ErrFilmNotFound
	}
	return nil
}

func (db *FilmDatabase) DeleteFilm(id uint) error {
	result := db.db.Delete(&f.FilmDTO{}, id)
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
	query := db.db.Model(&f.FilmDTO{})

	// Применяем фильтры
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
		query = query.Where("avg_rating >= ?", filters.MinRating)
	}
	if filters.MaxRating > 0 {
		query = query.Where("avg_rating <= ?", filters.MaxRating)
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

	var films []*f.FilmDTO
	if err := query.Find(&films).Error; err != nil {
		db.log.Error("failed to get films", "error", err, "filters", filters, "sort", sort)
		return nil, f.ErrInternal
	}

	return films, nil
}
