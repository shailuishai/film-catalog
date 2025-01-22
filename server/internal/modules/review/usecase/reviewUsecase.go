package usecase

import (
	"log/slog"
	r "server/internal/modules/review"
	"strconv"
	"time"
)

type ReviewUseCase struct {
	log *slog.Logger
	rp  r.Repo
}

func NewReviewUseCase(rp r.Repo, log *slog.Logger) *ReviewUseCase {
	return &ReviewUseCase{
		log: log,
		rp:  rp,
	}
}

// CreateReview создает новый отзыв
func (uc *ReviewUseCase) CreateReview(review *r.ReviewDTO) error {
	cacheKey := "reviews_film_" + strconv.Itoa(int(review.FilmID))
	_ = uc.rp.DeleteCache(cacheKey)
	cacheKey = "reviews_reviewer_" + strconv.Itoa(int(review.UserID))
	_ = uc.rp.DeleteCache(cacheKey)
	_ = uc.rp.DeleteCache("reviews_all")

	return uc.rp.CreateReview(review)
}

// MultiDeleteReview удоляет множество отзывов
func (uc *ReviewUseCase) MultiDeleteReview(reviewIDs []uint) error {
	for _, reviewID := range reviewIDs {
		cacheKey := "review_" + strconv.Itoa(int(reviewID))
		_ = uc.rp.DeleteCache(cacheKey)
	}
	_ = uc.rp.DeleteCache("reviews_all") // Инвалидация кэша всех отзывов
	return uc.rp.MultiDeleteReview(reviewIDs)
}

// UpdateReview обновляет отзыв
func (uc *ReviewUseCase) UpdateReview(review *r.ReviewDTO) error {
	cacheKey := "review_" + strconv.Itoa(int(review.ReviewID))
	_ = uc.rp.DeleteCache(cacheKey)
	cacheKey = "reviews_film_" + strconv.Itoa(int(review.FilmID))
	_ = uc.rp.DeleteCache(cacheKey)
	cacheKey = "reviews_reviewer_" + strconv.Itoa(int(review.UserID))
	_ = uc.rp.DeleteCache(cacheKey)
	_ = uc.rp.DeleteCache("reviews_all")

	return uc.rp.UpdateReview(review)
}

// DeleteReview удаляет отзыв по FilmId
func (uc *ReviewUseCase) DeleteReview(reviewID uint) error {
	cacheKey := "review_" + strconv.Itoa(int(reviewID))
	_ = uc.rp.DeleteCache(cacheKey)
	_ = uc.rp.DeleteCache("reviews_all")

	return uc.rp.DeleteReview(reviewID)
}

// GetReview возвращает отзыв по FilmId
func (uc *ReviewUseCase) GetReview(reviewID uint) (*r.ReviewDTO, error) {
	cacheKey := "review_" + strconv.Itoa(int(reviewID))

	// Попытка получить данные из кэша
	reviews, err := uc.rp.GetCache(cacheKey)
	if err == nil && len(reviews) > 0 {
		return reviews[0], nil
	}

	// Если данных в кэше нет, запрашиваем из базы
	review, err := uc.rp.GetReview(reviewID)
	if err != nil {
		return nil, err
	}

	// Кэшируем результат
	_ = uc.rp.SetCache(cacheKey, []*r.ReviewDTO{review}, time.Hour*24)

	return review, nil
}

// GetReviewsByFilmID возвращает отзывы по FilmId фильма
func (uc *ReviewUseCase) GetReviewsByFilmID(filmID uint) ([]*r.ReviewDTO, error) {
	cacheKey := "reviews_film_" + strconv.Itoa(int(filmID))

	// Попытка получить данные из кэша
	reviews, err := uc.rp.GetCache(cacheKey)
	if err == nil && reviews != nil {
		return reviews, nil
	}

	// Если данных в кэше нет, запрашиваем из базы
	reviews, err = uc.rp.GetReviewsByFilmID(filmID)
	if err != nil {
		return nil, err
	}

	// Кэшируем результат
	_ = uc.rp.SetCache(cacheKey, reviews, time.Hour*24)

	return reviews, nil
}

// GetReviewsByReviewerID возвращает отзывы по FilmId пользователя
func (uc *ReviewUseCase) GetReviewsByReviewerID(reviewerID uint) ([]*r.ReviewDTO, error) {
	cacheKey := "reviews_reviewer_" + strconv.Itoa(int(reviewerID))

	// Попытка получить данные из кэша
	reviews, err := uc.rp.GetCache(cacheKey)
	if err == nil && reviews != nil {
		return reviews, nil
	}

	// Если данных в кэше нет, запрашиваем из базы
	reviews, err = uc.rp.GetReviewsByReviewerID(reviewerID)
	if err != nil {
		return nil, err
	}

	// Кэшируем результат
	_ = uc.rp.SetCache(cacheKey, reviews, time.Hour*24)

	return reviews, nil
}

// GetAllReviews возвращает все отзывы в системе
func (uc *ReviewUseCase) GetAllReviews() ([]*r.ReviewDTO, error) {
	cacheKey := "reviews_all"

	// Попытка получить данные из кэша
	reviews, err := uc.rp.GetCache(cacheKey)
	if err == nil && reviews != nil {
		return reviews, nil
	}

	// Если данных в кэше нет, запрашиваем из базы
	reviews, err = uc.rp.GetAllReviews()
	if err != nil {
		return nil, err
	}

	// Кэшируем результат
	_ = uc.rp.SetCache(cacheKey, reviews, time.Hour*24)

	return reviews, nil
}
