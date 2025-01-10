package database

import (
	"errors"
	"github.com/jackc/pgx/v5/pgconn"
	"gorm.io/gorm"
	"gorm.io/gorm/clause"
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
	if err := db.db.Create(reviewModel).Error; err != nil {
		var pgErr *pgconn.PgError
		if errors.As(err, &pgErr) {
			if pgErr.Code == "23505" {
				db.log.Error("Duplicate key violation")
				return r.ErrReviewExists
			}
		}
		return err
	}
	return nil
}

func (db *ReviewDatabase) UpdateReview(review *r.ReviewDTO) error {
	reviewModel := review.ToModel()

	result := db.db.Clauses(clause.OnConflict{
		Columns:   []clause.Column{{Name: "user_id"}, {Name: "film_id"}},
		DoUpdates: clause.AssignmentColumns([]string{"rating", "review_text", "create_at"}),
	}).Create(reviewModel)

	return result.Error
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
	result := db.db.Delete(&r.Review{}, reviewID)

	if result.Error != nil {
		return r.ErrInternal
	}
	if result.RowsAffected == 0 {
		return r.ErrNoSuchReview
	}

	return nil
}
