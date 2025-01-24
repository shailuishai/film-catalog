package controller

import (
	"github.com/go-playground/validator/v10"
	"regexp"
)

// controller.CreateFilmRequest
type CreateFilmRequest struct {
	Title        string `json:"title" validate:"required"`
	Synopsis     string `json:"synopsis" validate:"required"`
	ReleaseDate  string `json:"release_date" validate:"required"`
	Runtime      string `json:"runtime" validate:"required,runtime_format"`
	Producer     string `json:"producer" validate:"required"`
	GenreIDs     []uint `json:"genre_ids" validate:"required,min=1"`
	ActorIDs     []uint `json:"actor_ids" validate:"required,min=1"`
	RemovePoster bool   `json:"remove_poster" validate:"boolean"`
}

func validateRuntimeFormat(fl validator.FieldLevel) bool {
	runtime := fl.Field().String()

	pattern := `^\d+h\s*\d*m$|^\d+h$|^\d+m$`
	matched, _ := regexp.MatchString(pattern, runtime)

	return matched
}

func removeDuplicates(slice []uint) []uint {
	encountered := map[uint]bool{}
	result := []uint{}

	for _, v := range slice {
		if !encountered[v] {
			encountered[v] = true
			result = append(result, v)
		}
	}
	return result
}

func (r *CreateFilmRequest) Sanitize() {
	r.GenreIDs = removeDuplicates(r.GenreIDs)
	r.ActorIDs = removeDuplicates(r.ActorIDs)
}
