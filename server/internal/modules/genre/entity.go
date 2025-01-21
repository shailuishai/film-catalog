package genre

import (
	"net/http"
	"time"
)

type GenreDTO struct {
	GenreId  uint      `json:"genre_id"`
	Name     string    `json:"name"`
	CreateAt time.Time `json:"create_at"`
}

type Controller interface {
	CreateGenre(w http.ResponseWriter, r *http.Request)
	UpdateGenre(w http.ResponseWriter, r *http.Request)
	GetGenres(w http.ResponseWriter, r *http.Request)
	GetGenre(w http.ResponseWriter, r *http.Request)
	DeleteGenre(w http.ResponseWriter, r *http.Request)
	AdminMultiDeleteGenre(w http.ResponseWriter, r *http.Request)
}

type UseCase interface {
	CreateGenre(name string) (uint, error)
	UpdateGenre(genreID uint, newName string) error
	GetGenre(genreID uint) (*GenreDTO, error)
	GetGenres() ([]*GenreDTO, error)
	DeleteGenre(genreID uint) error
	MultiDeleteGenre(genreIDs []uint) error
}

type Repo interface {
	CreateGenre(name string) (uint, error)
	UpdateGenre(genre *GenreDTO) error
	GetGenre(genreID uint) (*GenreDTO, error)
	GetGenres() ([]*GenreDTO, error)
	DeleteGenre(genreID uint) error
	SetCacheGenre(key string, value interface{}, ttl time.Duration) error
	GetCacheGenre(key string) ([]*GenreDTO, error)
	DeleteCacheGenre(key string) error
	MultiDeleteGenre(genreIDs []uint) error
}
