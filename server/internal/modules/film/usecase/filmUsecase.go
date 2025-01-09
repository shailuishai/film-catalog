package usecase

import (
	"crypto/sha256"
	"encoding/hex"
	"fmt"
	"log/slog"
	"mime/multipart"
	f "server/internal/modules/film"
	avatarManager "server/pkg/lib/avatarMenager"
	"strings"
	"time"
)

type FilmUseCase struct {
	log *slog.Logger
	rp  f.Repo
}

func NewFilmUsecase(rp f.Repo, l *slog.Logger) *FilmUseCase {
	return &FilmUseCase{
		log: l,
		rp:  rp,
	}
}

func (uc *FilmUseCase) GetFilmByID(id uint) (*f.FilmDTO, error) {
	cacheKey := fmt.Sprintf("film:%d", id)
	if film, err := uc.rp.GetFilmsFromCache(cacheKey); err == nil {
		return film[0], nil
	}

	film, err := uc.rp.GetFilmByID(id)
	if err != nil {
		return nil, err
	}

	if err := uc.rp.SetFilmsToCache(cacheKey, []*f.FilmDTO{film}, time.Hour); err != nil {
		uc.log.Error("failed to cache film", "error", err)
	}

	return film, nil
}

func (uc *FilmUseCase) CreateFilm(film *f.FilmDTO, poster *multipart.File) error {
	if poster != nil {
		_, posterBytes, err := avatarManager.ParsingPosterImage(poster)
		if err != nil {
			return err
		}
		posterUrl, err := uc.rp.UploadPoster(film.ID, posterBytes)
		if err != nil {
			return f.ErrFilmPosterUploadFailed
		}
		film.PosterURL = posterUrl
	}

	if err := uc.rp.CreateFilm(film); err != nil {
		return err
	}

	if err := uc.rp.IndexFilm(film); err != nil {
		uc.log.Error("failed to index film in Elasticsearch", "error", err)
	}

	return nil
}

func (uc *FilmUseCase) UpdateFilm(film *f.FilmDTO, poster *multipart.File) error {
	if film.RemovePoster {
		if err := uc.rp.DeletePoster(film.ID); err != nil {
			return f.ErrFilmPosterNotFound
		}
	}

	if poster != nil {
		_, posterBytes, err := avatarManager.ParsingAvatarImage(poster)
		if err != nil {
			return err
		}
		posterUrl, err := uc.rp.UploadPoster(film.ID, posterBytes)
		if err != nil {
			return f.ErrFilmPosterUploadFailed
		}
		film.PosterURL = posterUrl
	}

	if err := uc.rp.UpdateFilm(film); err != nil {
		return err
	}

	if err := uc.rp.IndexFilm(film); err != nil {
		uc.log.Error("failed to index film in Elasticsearch", "error", err)
	}

	cacheKey := fmt.Sprintf("film:%d", film.ID)
	if err := uc.rp.DeleteFilmFromCache(cacheKey); err != nil {
		uc.log.Error("failed to delete film from cache", "error", err)
	}

	return nil
}

func (uc *FilmUseCase) DeleteFilm(id uint) error {
	if err := uc.rp.DeleteFilm(id); err != nil {
		return err
	}

	if err := uc.rp.DeletePoster(id); err != nil {
		uc.log.Error("failed to delete poster from S3", "error", err)
	}

	cacheKey := fmt.Sprintf("film:%d", id)
	if err := uc.rp.DeleteFilmFromCache(cacheKey); err != nil {
		uc.log.Error("failed to delete film from cache", "error", err)
	}

	if err := uc.rp.DeleteFilmFromIndex(id); err != nil {
		uc.log.Error("failed to delete film from Elasticsearch index", "error", err)
	}

	return nil
}

func (uc *FilmUseCase) SearchFilms(query string) ([]*f.FilmDTO, error) {
	films, err := uc.rp.SearchFilms(query)
	if err != nil {
		return nil, f.ErrFilmSearchFailed
	}
	return films, nil
}

func (uc *FilmUseCase) GetFilms(filters f.FilmFilters, sort f.FilmSort) ([]*f.FilmDTO, error) {
	cacheKey := generateCacheKey(filters, sort)

	if films, err := uc.rp.GetFilmsFromCache(cacheKey); err == nil {
		return films, nil
	}

	films, err := uc.rp.GetFilms(filters, sort)
	if err != nil {
		return nil, err
	}

	if err := uc.rp.SetFilmsToCache(cacheKey, films, time.Minute*5); err != nil {
		uc.log.Error("failed to cache films", "error", err)
	}

	return films, nil
}

func generateCacheKey(filters f.FilmFilters, sort f.FilmSort) string {
	var keyParts []string

	if len(filters.GenreIDs) > 0 {
		keyParts = append(keyParts, fmt.Sprintf("genre_ids=%v", filters.GenreIDs))
	}
	if len(filters.ActorIDs) > 0 {
		keyParts = append(keyParts, fmt.Sprintf("actor_ids=%v", filters.ActorIDs))
	}
	if filters.Producer != "" {
		keyParts = append(keyParts, fmt.Sprintf("producer=%s", filters.Producer))
	}
	if filters.MinRating > 0 {
		keyParts = append(keyParts, fmt.Sprintf("min_rating=%f", filters.MinRating))
	}
	if filters.MaxRating > 0 {
		keyParts = append(keyParts, fmt.Sprintf("max_rating=%f", filters.MaxRating))
	}
	if !filters.MinDate.IsZero() {
		keyParts = append(keyParts, fmt.Sprintf("min_date=%s", filters.MinDate.Format(time.RFC3339)))
	}
	if !filters.MaxDate.IsZero() {
		keyParts = append(keyParts, fmt.Sprintf("max_date=%s", filters.MaxDate.Format(time.RFC3339)))
	}
	if filters.MinDuration > 0 {
		keyParts = append(keyParts, fmt.Sprintf("min_duration=%s", filters.MinDuration.String()))
	}
	if filters.MaxDuration > 0 {
		keyParts = append(keyParts, fmt.Sprintf("max_duration=%s", filters.MaxDuration.String()))
	}
	if sort.By != "" {
		keyParts = append(keyParts, fmt.Sprintf("sort_by=%s", sort.By))
	}
	if sort.Order != "" {
		keyParts = append(keyParts, fmt.Sprintf("order=%s", sort.Order))
	}

	keyParts = append(keyParts, fmt.Sprintf("page=%d", filters.Page))
	keyParts = append(keyParts, fmt.Sprintf("page_size=%d", filters.PageSize))

	keyString := strings.Join(keyParts, "&")

	hash := sha256.New()
	hash.Write([]byte(keyString))
	hashedKey := hash.Sum(nil)

	return "films:" + hex.EncodeToString(hashedKey)
}
