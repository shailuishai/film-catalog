package repo

import g "server/internal/modules/genre"

type GenreDB interface {
	CreateGenre(name string) (uint, error)
	UpdateGenre(genre *g.GenreDTO) error
	GetGenre(genreID uint) (*g.GenreDTO, error)
	GetGenres() ([]*g.GenreDTO, error)
	DeleteGenre(genreID uint) error
}

type Repo struct {
	genreDB GenreDB
}

func NewGenreRepo(genreDB GenreDB) *Repo {
	return &Repo{genreDB: genreDB}
}

func (r *Repo) CreateGenre(name string) (uint, error) {
	return r.genreDB.CreateGenre(name)
}

func (r *Repo) UpdateGenre(genre *g.GenreDTO) error {
	return r.genreDB.UpdateGenre(genre)
}

func (r *Repo) GetGenre(genreID uint) (*g.GenreDTO, error) {
	return r.genreDB.GetGenre(genreID)
}

func (r *Repo) GetGenres() ([]*g.GenreDTO, error) {
	return r.genreDB.GetGenres()
}

func (r *Repo) DeleteGenre(genreID uint) error {
	return r.genreDB.DeleteGenre(genreID)
}
