package database

import (
	"errors"
	"gorm.io/gorm"
	"log/slog"
	g "server/internal/modules/genre"
)

type GenreDatabase struct {
	db  *gorm.DB
	log *slog.Logger
}

func NewGenreDatabase(db *gorm.DB, log *slog.Logger) *GenreDatabase {
	return &GenreDatabase{
		db:  db,
		log: log,
	}
}

func (db *GenreDatabase) CreateGenre(name string) (uint, error) {
	genre := &g.Genre{
		Name: name,
	}

	if err := db.db.Create(genre).Error; err != nil {
		if errors.Is(err, gorm.ErrDuplicatedKey) {
			return 0, g.ErrGenreExists
		}
		return 0, err
	}

	return genre.GenreID, nil
}

func (db *GenreDatabase) UpdateGenre(genre *g.GenreDTO) error {
	genreM := g.FromDTO(genre)

	if err := db.db.Save(genreM).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return g.ErrNoSuchGenre
		}
		return err
	}

	return nil
}

func (db *GenreDatabase) GetGenre(genreID uint) (*g.GenreDTO, error) {
	var genre *g.Genre

	if err := db.db.First(&genre, genreID).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, g.ErrNoSuchGenre
		}
		return nil, err
	}

	return g.ToDTO(genre), nil
}

func (db *GenreDatabase) GetGenres() ([]*g.GenreDTO, error) {
	var genres []*g.Genre

	if err := db.db.Find(&genres).Error; err != nil {
		return nil, err
	}
	if len(genres) == 0 {
		return nil, g.ErrNoSuchGenre
	}
	var genresDTO []*g.GenreDTO
	for _, genre := range genres {
		genresDTO = append(genresDTO, g.ToDTO(genre))
	}

	return genresDTO, nil
}

func (db *GenreDatabase) DeleteGenre(genreID uint) error {
	if err := db.db.Delete(&g.Genre{GenreID: genreID}).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return g.ErrNoSuchGenre
		}
		return err
	}
	return nil
}
