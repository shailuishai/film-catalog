package review

import (
	"net/http"
	"time"
)

type ReviewDTO struct {
	ReviewID   uint      `json:"review_id"`
	UserID     uint      `json:"user_id"`
	FilmID     uint      `json:"film_id"`
	Rating     int       `json:"rating"`
	ReviewText string    `json:"review_text"`
	CreateAt   time.Time `json:"create_at"`
}

type Controller interface {
	CreateReview(w http.ResponseWriter, r *http.Request)
	GetReview(w http.ResponseWriter, r *http.Request)
	UpdateReview(w http.ResponseWriter, r *http.Request)
	DeleteReview(w http.ResponseWriter, r *http.Request)
	GetReviewsByFilmID(w http.ResponseWriter, r *http.Request)
	GetReviewsByReviewerID(w http.ResponseWriter, r *http.Request)
}

type UseCase interface {
	CreateReview(review *ReviewDTO) error
	GetReview(reviewID uint) (*ReviewDTO, error)
	UpdateReview(review *ReviewDTO) error
	DeleteReview(reviewID uint) error
	GetReviewsByFilmID(filmID uint) ([]*ReviewDTO, error)
	GetReviewsByReviewerID(reviewerID uint) ([]*ReviewDTO, error)
}

type Repo interface {
	CreateReview(review *ReviewDTO) error
	GetReview(reviewID uint) (*ReviewDTO, error)
	UpdateReview(review *ReviewDTO) error
	DeleteReview(reviewID uint) error
	GetReviewsByFilmID(filmID uint) ([]*ReviewDTO, error)
	GetReviewsByReviewerID(reviewerID uint) ([]*ReviewDTO, error)
	SetCache(key string, value interface{}, ttl time.Duration) error
	GetCache(key string) ([]*ReviewDTO, error)
	DeleteCache(key string) error
}
