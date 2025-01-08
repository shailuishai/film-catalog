package genre

import "errors"

var (
	ErrInternalServer = errors.New("internal server error")
	ErrNoSuchGenre    = errors.New("no such genre")
	ErrGenreExists    = errors.New("genre already exists")
)
