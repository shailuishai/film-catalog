package film

import "errors"

var (
	ErrInternal               = errors.New("internal server error")
	ErrFilmNotFound           = errors.New("film not found")
	ErrFilmAlreadyExists      = errors.New("film already exists")
	ErrInvalidFilmData        = errors.New("invalid film data")
	ErrFilmCacheMiss          = errors.New("film cache miss")
	ErrFilmPosterUploadFailed = errors.New("film poster upload failed")
	ErrFilmPosterNotFound     = errors.New("film poster not found")
	ErrFilmSearchFailed       = errors.New("film search failed")
	ErrGenreNotFound          = errors.New("genre not found")
	ErrActorNotFound          = errors.New("actor not found")
)
