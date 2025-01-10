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
	_ = uc.rp.DeleteCache(cacheKey) // Инвалидация кэша

	return uc.rp.CreateReview(review)
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

// UpdateReview обновляет отзыв
func (uc *ReviewUseCase) UpdateReview(review *r.ReviewDTO) error {
	cacheKey := "review_" + strconv.Itoa(int(review.ReviewID))
	_ = uc.rp.DeleteCache(cacheKey) // Инвалидация кэша

	return uc.rp.UpdateReview(review)
}

// DeleteReview удаляет отзыв по FilmId
func (uc *ReviewUseCase) DeleteReview(reviewID uint) error {
	cacheKey := "review_" + strconv.Itoa(int(reviewID))
	_ = uc.rp.DeleteCache(cacheKey)

	return uc.rp.DeleteReview(reviewID)
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
