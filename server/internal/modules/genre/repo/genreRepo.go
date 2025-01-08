package repo

import (
	g "server/internal/modules/genre"
	"time"
)

type GenreDB interface {
	CreateGenre(name string) (uint, error)
	UpdateGenre(genre *g.GenreDTO) error
	GetGenre(genreID uint) (*g.GenreDTO, error)
	GetGenres() ([]*g.GenreDTO, error)
	DeleteGenre(genreID uint) error
}

type GenreCh interface {
	SetCacheGenre(key string, value interface{}, ttl time.Duration) error
	GetCacheGenre(key string) ([]*g.GenreDTO, error)
	DeleteCacheGenre(key string) error
}

type Repo struct {
	db GenreDB
	ch GenreCh
}

func NewGenreRepo(db GenreDB, ch GenreCh) *Repo {
	return &Repo{db: db,
		ch: ch}
}

func (r *Repo) CreateGenre(name string) (uint, error) {
	return r.db.CreateGenre(name)
}

func (r *Repo) UpdateGenre(genre *g.GenreDTO) error {
	return r.db.UpdateGenre(genre)
}

func (r *Repo) GetGenre(genreID uint) (*g.GenreDTO, error) {
	return r.db.GetGenre(genreID)
}

func (r *Repo) GetGenres() ([]*g.GenreDTO, error) {
	return r.db.GetGenres()
}

func (r *Repo) DeleteGenre(genreID uint) error {
	return r.db.DeleteGenre(genreID)
}

func (r *Repo) SetCacheGenre(key string, value interface{}, ttl time.Duration) error {
	return r.ch.SetCacheGenre(key, value, ttl)
}

func (r *Repo) GetCacheGenre(key string) ([]*g.GenreDTO, error) {
	return r.ch.GetCacheGenre(key)
}

func (r *Repo) DeleteCacheGenre(key string) error {
	return r.ch.DeleteCacheGenre(key)
}
