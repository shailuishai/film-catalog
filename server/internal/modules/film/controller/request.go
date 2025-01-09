package controller

import "time"

type CreateFilmRequest struct {
	Synopsis    string        `json:"synopsis" validate:"required"`
	ReleaseDate time.Time     `json:"release_date" validate:"required"`
	Runtime     time.Duration `json:"runtime" validate:"required,min=1"`
	Producer    string        `json:"producer" validate:"required"`
	GenreIDs    []uint        `json:"genre_ids" validate:"required,min=1"`
	ActorIDs    []uint        `json:"actor_ids" validate:"required,min=1"`
}
