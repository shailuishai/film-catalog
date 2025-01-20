package review

import (
	"net/http"
	"time"
)

type ReviewDTO struct {
	ReviewID      uint      `json:"review_id"`
	UserID        uint      `json:"user_id"`
	UserAvatarURL string    `json:"user_avatar_url"`
	FilmID        uint      `json:"film_id"`
	FilmPosterURL string    `json:"film_poster_url"`
	Rating        int       `json:"rating"`
	ReviewText    string    `json:"review_text"`
	CreateAt      time.Time `json:"create_at"`
}

type Controller interface {
	CreateReview(w http.ResponseWriter, r *http.Request)           // только пользователь только свой коментарий
	GetReview(w http.ResponseWriter, r *http.Request)              // без авторизации
	UpdateReview(w http.ResponseWriter, r *http.Request)           // только пользователь только свой коментарий
	DeleteReview(w http.ResponseWriter, r *http.Request)           // только пользователь только свой коментарий
	GetReviewsByFilmID(w http.ResponseWriter, r *http.Request)     // без авторизации
	GetReviewsByReviewerID(w http.ResponseWriter, r *http.Request) // только пользователь только свои коментарии

	// Методы для администратора
	AdminCreateReview(w http.ResponseWriter, r *http.Request)  // администратор может создать отзыв от имени любого пользователя
	AdminUpdateReview(w http.ResponseWriter, r *http.Request)  // администратор может обновить любой отзыв
	AdminDeleteReview(w http.ResponseWriter, r *http.Request)  // администратор может удалить любой отзыв
	AdminGetAllReviews(w http.ResponseWriter, r *http.Request) // администратор может получить все отзывы в системе
}

type UseCase interface {
	CreateReview(review *ReviewDTO) error
	GetReview(reviewID uint) (*ReviewDTO, error)
	UpdateReview(review *ReviewDTO) error
	DeleteReview(reviewID uint) error
	GetReviewsByFilmID(filmID uint) ([]*ReviewDTO, error)
	GetReviewsByReviewerID(reviewerID uint) ([]*ReviewDTO, error)

	// Методы для администратора
	GetAllReviews() ([]*ReviewDTO, error)
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

	// Методы для администратора
	GetAllReviews() ([]*ReviewDTO, error)
}
