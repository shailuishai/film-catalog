package usecase

import (
	"log/slog"
	g "server/internal/modules/genre"
)

type GenreUsecase struct {
	log *slog.Logger
	rp  g.Repo
}

func NewGenreUsecase(rp g.Repo, l *slog.Logger) *GenreUsecase {
	return &GenreUsecase{
		log: l,
		rp:  rp,
	}
}

func (uc *GenreUsecase) CreateGenre(name string) (uint, error) {
	return uc.rp.CreateGenre(name)
}

func (uc *GenreUsecase) UpdateGenre(genreID uint, newName string) error {
	genre := &g.GenreDTO{
		Name:    newName,
		GenreId: genreID,
	}

	return uc.rp.UpdateGenre(genre)
}

func (uc *GenreUsecase) GetGenre(genreID uint) (*g.GenreDTO, error) {
	return uc.rp.GetGenre(genreID)
}

func (uc *GenreUsecase) GetGenres() ([]*g.GenreDTO, error) {
	return uc.rp.GetGenres()
}

func (uc *GenreUsecase) DeleteGenre(genreID uint) error {
	return uc.rp.DeleteGenre(genreID)
}
