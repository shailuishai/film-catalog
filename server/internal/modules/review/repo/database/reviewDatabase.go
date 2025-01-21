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
	var reviewsWithDetails r.ReviewWithDetails

	if err := db.db.Table("reviews").
		Select("reviews.*, users.avatar_url as user_avatar_url, users.login as user_login, films.poster_url as film_poster_url, films.title as film_title").
		Joins("JOIN users ON reviews.user_id = users.user_id").
		Joins("JOIN films ON reviews.film_id = films.film_id").
		Where("reviews.review_id = ?", reviewID).
		First(&reviewsWithDetails).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, r.ErrNoSuchReview
		}
		return nil, err
	}

	return reviewsWithDetails.ToDTO(reviewsWithDetails.UserAvatarURL, reviewsWithDetails.FilmPosterURL, reviewsWithDetails.UserLogin, reviewsWithDetails.FilmTitle), nil
}

func (db *ReviewDatabase) GetReviewsByFilmID(filmID uint) ([]*r.ReviewDTO, error) {
	var reviewsWithDetails []*r.ReviewWithDetails

	if err := db.db.Table("reviews").
		Select("reviews.*, users.avatar_url as user_avatar_url, users.login as user_login, films.poster_url as film_poster_url, films.title as film_title").
		Joins("JOIN users ON reviews.user_id = users.user_id").
		Joins("JOIN films ON reviews.film_id = films.film_id").
		Where("reviews.film_id = ?", filmID).
		Find(&reviewsWithDetails).Error; err != nil {
		return nil, err
	}

	if len(reviewsWithDetails) == 0 {
		return nil, r.ErrNoSuchReview
	}

	dtos := r.ToDTOList(reviewsWithDetails)

	return dtos, nil
}

func (db *ReviewDatabase) GetReviewsByReviewerID(reviewerID uint) ([]*r.ReviewDTO, error) {
	var reviewsWithDetails []*r.ReviewWithDetails

	// Выполняем JOIN с таблицами users и films
	if err := db.db.Table("reviews").
		Select("reviews.*, users.avatar_url as user_avatar_url, users.login as user_login, films.poster_url as film_poster_url, films.title as film_title").
		Joins("JOIN users ON reviews.user_id = users.user_id").
		Joins("JOIN films ON reviews.film_id = films.film_id").
		Where("reviews.user_id = ?", reviewerID).
		Find(&reviewsWithDetails).Error; err != nil {
		return nil, err
	}

	if len(reviewsWithDetails) == 0 {
		return nil, r.ErrNoSuchReview
	}

	// Преобразуем ReviewWithDetails в ReviewDTO
	dtos := r.ToDTOList(reviewsWithDetails)

	return dtos, nil
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

// GetAllReviews возвращает все отзывы из базы данных
func (db *ReviewDatabase) GetAllReviews() ([]*r.ReviewDTO, error) {
	var reviewsWithDetails []*r.ReviewWithDetails

	if err := db.db.Table("reviews").
		Select("reviews.*, users.avatar_url as user_avatar_url, users.login as user_login, films.poster_url as film_poster_url, films.title as film_title").
		Joins("JOIN users ON reviews.user_id = users.user_id").
		Joins("JOIN films ON reviews.film_id = films.film_id").
		Find(&reviewsWithDetails).Error; err != nil {
		return nil, err
	}

	if len(reviewsWithDetails) == 0 {
		return nil, r.ErrNoSuchReview
	}

	dtos := r.ToDTOList(reviewsWithDetails)

	return dtos, nil
}

// reviewDatabase.go
func (db *ReviewDatabase) MultiDeleteReview(reviewIDs []uint) error {
	result := db.db.Where("review_id IN ?", reviewIDs).Delete(&r.Review{})
	if result.Error != nil {
		return result.Error
	}
	return nil
}
