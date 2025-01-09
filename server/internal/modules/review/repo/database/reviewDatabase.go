package database

import (
	"errors"
	"gorm.io/gorm"
	"log/slog"
	r "server/internal/modules/review"
)

type ReviewDatabase struct {
	db  *gorm.DB
	log *slog.Logger
}

func NewReviewDatabase(db *gorm.DB, log *slog.Logger) *ReviewDatabase {
	return &ReviewDatabase{
		db:  db,
		log: log,
	}
}

func (db *ReviewDatabase) CreateReview(review *r.ReviewDTO) error {
	reviewModel := review.ToModel()
	return db.db.Create(reviewModel).Error
}

func (db *ReviewDatabase) UpdateReview(review *r.ReviewDTO) error {
	reviewModel := review.ToModel()
	return db.db.Save(reviewModel).Error
}

func (db *ReviewDatabase) GetReview(reviewID uint) (*r.ReviewDTO, error) {
	var review r.Review
	if err := db.db.First(&review, reviewID).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, r.ErrNoSuchReview
		}
		return nil, err
	}
	return review.ToDTO(), nil
}

func (db *ReviewDatabase) GetReviewsByFilmID(filmID uint) ([]*r.ReviewDTO, error) {
	var reviews []*r.Review
	if err := db.db.Where("film_id = ?", filmID).Find(&reviews).Error; err != nil {
		return nil, err
	}
	if len(reviews) == 0 {
		return nil, r.ErrNoSuchReview
	}
	return r.ToDTOList(reviews), nil
}

func (db *ReviewDatabase) GetReviewsByReviewerID(reviewerID uint) ([]*r.ReviewDTO, error) {
	var reviews []*r.Review
	if err := db.db.Where("user_id = ?", reviewerID).Find(&reviews).Error; err != nil {
		return nil, err
	}
	if len(reviews) == 0 {
		return nil, r.ErrNoSuchReview
	}
	return r.ToDTOList(reviews), nil
}

func (db *ReviewDatabase) DeleteReview(reviewID uint) error {
	return db.db.Delete(&r.Review{}, reviewID).Error
}
