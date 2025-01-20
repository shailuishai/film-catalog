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
	var userAvatarURL string
	var filmPosterURL string

	// Выполняем JOIN с таблицами user и film
	if err := db.db.Table("reviews").
		Select("reviews.*, user.avatar_url as user_avatar_url, film.poster_url as film_poster_url").
		Joins("JOIN user ON reviews.user_id = user.user_id").
		Joins("JOIN film ON reviews.film_id = film.film_id").
		Where("reviews.review_id = ?", reviewID).
		First(&review).Scan(&userAvatarURL).Scan(&filmPosterURL).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, r.ErrNoSuchReview
		}
		return nil, err
	}

	return review.ToDTO(userAvatarURL, filmPosterURL), nil
}

func (db *ReviewDatabase) GetReviewsByFilmID(filmID uint) ([]*r.ReviewDTO, error) {
	var reviews []*r.Review
	var userAvatarURLs []string
	var filmPosterURLs []string

	// Выполняем JOIN с таблицами user и film
	if err := db.db.Table("reviews").
		Select("reviews.*, user.avatar_url as user_avatar_url, film.poster_url as film_poster_url").
		Joins("JOIN user ON reviews.user_id = user.user_id").
		Joins("JOIN film ON reviews.film_id = film.film_id").
		Where("reviews.film_id = ?", filmID).
		Find(&reviews).Scan(&userAvatarURLs).Scan(&filmPosterURLs).Error; err != nil {
		return nil, err
	}

	if len(reviews) == 0 {
		return nil, r.ErrNoSuchReview
	}

	return r.ToDTOList(reviews, userAvatarURLs, filmPosterURLs), nil
}

func (db *ReviewDatabase) GetReviewsByReviewerID(reviewerID uint) ([]*r.ReviewDTO, error) {
	var reviews []*r.Review
	var userAvatarURLs []string
	var filmPosterURLs []string

	// Выполняем JOIN с таблицами user и film
	if err := db.db.Table("reviews").
		Select("reviews.*, user.avatar_url as user_avatar_url, film.poster_url as film_poster_url").
		Joins("JOIN user ON reviews.user_id = user.user_id").
		Joins("JOIN film ON reviews.film_id = film.film_id").
		Where("reviews.user_id = ?", reviewerID).
		Find(&reviews).Scan(&userAvatarURLs).Scan(&filmPosterURLs).Error; err != nil {
		return nil, err
	}

	if len(reviews) == 0 {
		return nil, r.ErrNoSuchReview
	}

	return r.ToDTOList(reviews, userAvatarURLs, filmPosterURLs), nil
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
