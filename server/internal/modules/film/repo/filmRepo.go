package repo

import (
	f "server/internal/modules/film"
	"time"
)

type FilmDB interface {
	GetFilmByID(id uint) (*f.FilmDTO, error)
	CreateFilm(film *f.FilmDTO) (uint, error)
	UpdateFilm(film *f.FilmDTO) error
	DeleteFilm(id uint) error
	GetFilms(filters f.FilmFilters, sort f.FilmSort) ([]*f.FilmDTO, error)
}

type FilmCache interface {
	GetFilmsFromCache(key string) ([]*f.FilmDTO, error)
	SetFilmsToCache(key string, films interface{}, ttl time.Duration) error
	DeleteFilmFromCache(key string) error
}

type FilmS3 interface {
	UploadPoster(filmID uint, file []byte) (string, error)
	DeletePoster(filmID uint) error
}

type FilmES interface {
	SearchFilms(query string) ([]uint, error)
	IndexFilm(film *f.FilmDTO) error
	DeleteFilmFromIndex(filmID uint) error
}

type Repo struct {
	db FilmDB
	ch FilmCache
	s3 FilmS3
	es FilmES
}

func NewFilmRepo(db FilmDB, ch FilmCache, s3 FilmS3, es FilmES) *Repo {
	return &Repo{
		db: db,
		ch: ch,
		s3: s3,
		es: es,
	}
}

func (r *Repo) GetFilmByID(id uint) (*f.FilmDTO, error) {
	return r.db.GetFilmByID(id)
}

func (r *Repo) CreateFilm(film *f.FilmDTO) (uint, error) {
	return r.db.CreateFilm(film)
}

func (r *Repo) UpdateFilm(film *f.FilmDTO) error {
	return r.db.UpdateFilm(film)
}

func (r *Repo) DeleteFilm(id uint) error {
	return r.db.DeleteFilm(id)
}

func (r *Repo) GetFilms(filters f.FilmFilters, sort f.FilmSort) ([]*f.FilmDTO, error) {
	return r.db.GetFilms(filters, sort)
}

func (r *Repo) SearchFilms(query string) ([]uint, error) {
	return r.es.SearchFilms(query)
}

func (r *Repo) IndexFilm(film *f.FilmDTO) error {
	return r.es.IndexFilm(film)
}

func (r *Repo) DeleteFilmFromIndex(filmID uint) error {
	return r.es.DeleteFilmFromIndex(filmID)
}

func (r *Repo) GetFilmsFromCache(key string) ([]*f.FilmDTO, error) {
	return r.ch.GetFilmsFromCache(key)
}

func (r *Repo) SetFilmsToCache(key string, films interface{}, ttl time.Duration) error {
	return r.ch.SetFilmsToCache(key, films, ttl)
}

func (r *Repo) DeleteFilmFromCache(key string) error {
	return r.ch.DeleteFilmFromCache(key)
}

func (r *Repo) UploadPoster(filmID uint, file []byte) (string, error) {
	return r.s3.UploadPoster(filmID, file)
}

func (r *Repo) DeletePoster(filmID uint) error {
	return r.db.DeleteFilm(filmID)
}
