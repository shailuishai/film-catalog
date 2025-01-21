package repo

import (
	r "server/internal/modules/review"
	"time"
)

type ReviewDB interface {
	CreateReview(review *r.ReviewDTO) error
	UpdateReview(review *r.ReviewDTO) error
	GetReview(reviewID uint) (*r.ReviewDTO, error)
	GetReviewsByFilmID(filmID uint) ([]*r.ReviewDTO, error)
	GetReviewsByReviewerID(reviewerID uint) ([]*r.ReviewDTO, error)
	DeleteReview(reviewID uint) error
	GetAllReviews() ([]*r.ReviewDTO, error)
	MultiDeleteReview(reviewIDs []uint) error // удаление нескольких отзывов
}

type ReviewCache interface {
	SetCache(key string, value interface{}, ttl time.Duration) error
	GetCache(key string) ([]*r.ReviewDTO, error)
	DeleteCache(key string) error
}

type Repo struct {
	db ReviewDB
	ch ReviewCache
}

func NewReviewRepo(db ReviewDB, ch ReviewCache) *Repo {
	return &Repo{db: db, ch: ch}
}

func (r *Repo) CreateReview(review *r.ReviewDTO) error {
	return r.db.CreateReview(review)
}

func (r *Repo) UpdateReview(review *r.ReviewDTO) error {
	return r.db.UpdateReview(review)
}

func (r *Repo) GetReview(reviewID uint) (*r.ReviewDTO, error) {
	return r.db.GetReview(reviewID)
}

func (r *Repo) GetReviewsByFilmID(filmID uint) ([]*r.ReviewDTO, error) {
	return r.db.GetReviewsByFilmID(filmID)
}

func (r *Repo) GetReviewsByReviewerID(reviewerID uint) ([]*r.ReviewDTO, error) {
	return r.db.GetReviewsByReviewerID(reviewerID)
}

func (r *Repo) DeleteReview(reviewID uint) error {
	return r.db.DeleteReview(reviewID)
}

func (r *Repo) SetCache(key string, value interface{}, ttl time.Duration) error {
	return r.ch.SetCache(key, value, ttl)
}

func (r *Repo) GetCache(key string) ([]*r.ReviewDTO, error) {
	return r.ch.GetCache(key)
}

func (r *Repo) DeleteCache(key string) error {
	return r.ch.DeleteCache(key)
}

func (r *Repo) GetAllReviews() ([]*r.ReviewDTO, error) {
	return r.db.GetAllReviews()
}

func (r *Repo) MultiDeleteReview(reviewIDs []uint) error {
	return r.db.MultiDeleteReview(reviewIDs)
}
