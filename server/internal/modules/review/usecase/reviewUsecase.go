package usecase

import (
	"log/slog"
	r "server/internal/modules/review"
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

func (uc *ReviewUseCase) CreateReview(review *r.ReviewDTO) error {
	return uc.rp.CreateReview(review)
}

func (uc *ReviewUseCase) UpdateReview(review *r.ReviewDTO, userID uint) error {
	// Получаем текущий отзыв из базы данных
	currentReview, err := uc.rp.GetReview(review.ReviewID)
	if err != nil {
		return err
	}

	// Проверяем, что отзыв принадлежит текущему пользователю
	if currentReview.UserID != userID {
		return r.ErrUnauthorized // или другая ошибка, указывающая на отсутствие прав
	}

	// Обновляем только те поля, которые были переданы в запросе
	if review.Rating != 0 {
		currentReview.Rating = review.Rating
	}
	if review.ReviewText != "" {
		currentReview.ReviewText = review.ReviewText
	}

	// Сохраняем обновленный отзыв в базе данных
	return uc.rp.UpdateReview(currentReview)
}

func (uc *ReviewUseCase) DeleteReview(reviewID uint) error {
	return uc.rp.DeleteReview(reviewID)
}

func (uc *ReviewUseCase) GetReview(reviewID uint) (*r.ReviewDTO, error) {
	return uc.rp.GetReview(reviewID)
}

func (uc *ReviewUseCase) GetReviewsByFilmID(filmID uint) ([]*r.ReviewDTO, error) {
	return uc.rp.GetReviewsByFilmID(filmID)
}

func (uc *ReviewUseCase) GetReviewsByReviewerID(reviewerID uint) ([]*r.ReviewDTO, error) {
	return uc.rp.GetReviewsByReviewerID(reviewerID)
}

func (uc *ReviewUseCase) GetAllReviews() ([]*r.ReviewDTO, error) {
	return uc.rp.GetAllReviews()
}

func (uc *ReviewUseCase) MultiDeleteReview(reviewIDs []uint) error {
	return uc.rp.MultiDeleteReview(reviewIDs)
}
