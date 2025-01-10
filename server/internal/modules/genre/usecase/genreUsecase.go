package usecase

import (
	"log/slog"
	g "server/internal/modules/genre"
	"strconv"
	"time"
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
	_ = uc.rp.DeleteCacheGenre("genres")
	return uc.rp.CreateGenre(name)
}

func (uc *GenreUsecase) UpdateGenre(genreID uint, newName string) error {
	genre := &g.GenreDTO{
		Name:    newName,
		GenreId: genreID,
	}

	err := uc.rp.UpdateGenre(genre)
	if err != nil {
		return err
	}

	cacheKey := "genre_" + strconv.Itoa(int(genreID))
	_ = uc.rp.DeleteCacheGenre(cacheKey)

	return nil
}

func (uc *GenreUsecase) GetGenre(genreID uint) (*g.GenreDTO, error) {
	cacheKey := "genre_" + strconv.Itoa(int(genreID))
	genreFromCache, err := uc.rp.GetCacheGenre(cacheKey)
	if err == nil && genreFromCache[0] != nil {
		return nil, err
	}

	genre, err := uc.rp.GetGenre(genreID)
	if err != nil {
		return nil, err
	}

	err = uc.rp.SetCacheGenre(cacheKey, genre, time.Hour*24)
	if err != nil {
		return nil, err
	}

	return genre, nil
}

func (uc *GenreUsecase) GetGenres() ([]*g.GenreDTO, error) {
	cacheKey := "genres"

	genres, err := uc.rp.GetCacheGenre(cacheKey)
	if err == nil && genres != nil {
		return genres, nil
	}

	genres, err = uc.rp.GetGenres()
	if err != nil {
		return nil, err
	}

	err = uc.rp.SetCacheGenre(cacheKey, genres, time.Hour*24)
	if err != nil {
		return nil, err
	}

	return genres, nil
}

func (uc *GenreUsecase) DeleteGenre(genreID uint) error {
	err := uc.rp.DeleteGenre(genreID)
	if err != nil {
		return err
	}

	cacheKey := "genre_" + strconv.Itoa(int(genreID))
	_ = uc.rp.DeleteCacheGenre(cacheKey)

	_ = uc.rp.DeleteCacheGenre("genres")

	return nil
}
