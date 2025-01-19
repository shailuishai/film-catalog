package film

import (
	"mime/multipart"
	"net/http"
	"server/internal/modules/a"
	g "server/internal/modules/genre"
	"time"
)

type FilmDTO struct {
	ID          uint      `json:"id"`
	Title       string    `json:"title"`
	PosterURL   string    `json:"poster_url"`
	Synopsis    string    `json:"synopsis"`
	ReleaseDate time.Time `json:"release_date"`
	Runtime     string    `json:"runtime"`
	Producer    string    `json:"producer"`
	CreateAt    time.Time `json:"create_at"`

	AvgRating          float64 `json:"avg_rating"`
	TotalReviews       uint    `json:"total_reviews"`
	CountRatings0_20   uint    `json:"count_ratings_0_20"`
	CountRatings21_40  uint    `json:"count_ratings_21_40"`
	CountRatings41_60  uint    `json:"count_ratings_41_60"`
	CountRatings61_80  uint    `json:"count_ratings_61_80"`
	CountRatings81_100 uint    `json:"count_ratings_81_100"`

	GenreIDs []uint `json:"genre_ids"` // Только ID жанров
	ActorIDs []uint `json:"actor_ids"` // Только ID актеров

	Genres []g.GenreDTO `json:"genres"`
	Actors []a.ActorDTO `json:"actors"`

	RemovePoster bool `json:"remove_poster"`
}

type FilmFilters struct {
	GenreIDs    []uint        `validate:"omitempty,dive,min=1"`
	ActorIDs    []uint        `validate:"omitempty,dive,min=1"`
	Producer    string        `validate:"omitempty,min=1"`
	MinRating   float64       `validate:"omitempty,min=0,max=100"`
	MaxRating   float64       `validate:"omitempty,min=0,max=100"`
	MinDate     time.Time     `validate:"omitempty"`
	MaxDate     time.Time     `validate:"omitempty"`
	MinDuration time.Duration `validate:"omitempty"`
	MaxDuration time.Duration `validate:"omitempty"`
	Page        int           `validate:"required,min=1"`
	PageSize    int           `validate:"required,min=1,max=100"`
}

type FilmSort struct {
	By    string `validate:"omitempty,oneof=avg_rating release_date runtime"`
	Order string `validate:"omitempty,oneof=asc desc"`
}

type Controller interface {
	GetFilmByID(w http.ResponseWriter, r *http.Request)
	CreateFilm(w http.ResponseWriter, r *http.Request)
	UpdateFilm(w http.ResponseWriter, r *http.Request)
	DeleteFilm(w http.ResponseWriter, r *http.Request)
	SearchFilms(w http.ResponseWriter, r *http.Request)
	GetFilms(w http.ResponseWriter, r *http.Request)
}

type UseCase interface {
	GetFilmByID(id uint) (*FilmDTO, error)
	CreateFilm(film *FilmDTO, poster *multipart.File) error
	UpdateFilm(film *FilmDTO, poster *multipart.File) error
	DeleteFilm(id uint) error
	SearchFilms(query string) ([]*FilmDTO, error)
	GetFilms(filters FilmFilters, sort FilmSort) ([]*FilmDTO, error)
}

type Repo interface {
	//DB
	GetFilmByID(id uint) (*FilmDTO, error)
	CreateFilm(film *FilmDTO) (uint, error)
	UpdateFilm(film *FilmDTO) error
	DeleteFilm(id uint) error
	GetFilms(filters FilmFilters, sort FilmSort) ([]*FilmDTO, error)

	//ES
	SearchFilms(query string) ([]uint, error)
	IndexFilm(film *FilmDTO) error

	//Cache
	GetFilmsFromCache(key string) ([]*FilmDTO, error)
	SetFilmsToCache(key string, films interface{}, ttl time.Duration) error
	DeleteFilmFromCache(key string) error

	//S3
	UploadPoster(filmID uint, file []byte) (string, error)
	DeletePoster(filmID uint) error
	DeleteFilmFromIndex(filmID uint) error
}
