package controller

import (
	"errors"
	"github.com/go-chi/chi/v5"
	"github.com/go-chi/render"
	"github.com/go-playground/validator/v10"
	"log/slog"
	"net/http"
	r "server/internal/modules/review"
	resp "server/pkg/lib/response"
	"strconv"
)

type ReviewController struct {
	log      *slog.Logger
	uc       r.UseCase
	validate *validator.Validate
}

func NewReviewController(log *slog.Logger, uc r.UseCase) *ReviewController {
	validate := validator.New()
	return &ReviewController{
		log:      log,
		uc:       uc,
		validate: validate,
	}
}

// CreateReview - Создание нового отзыва
// @Summary Создание нового отзыва
// @Description Создает новый отзыв с указанными данными
// @Tags         review
// @Accept       json
// @Produce      json
// @Param        json body CreateReviewRequest true "Данные отзыва"
// @Success 201 {object} response.Response
// @Failure 400 {object} response.Response
// @Failure 500 {object} response.Response
// @Router /reviews [post]
func (c *ReviewController) CreateReview(w http.ResponseWriter, req *http.Request) {
	log := c.log.With("op", "CreateReview")

	var request CreateReviewRequest
	if err := render.DecodeJSON(req.Body, &request); err != nil {
		log.Error("failed to decode request body", err)
		w.WriteHeader(http.StatusBadRequest)
		render.JSON(w, req, resp.Error("failed to decode request"))
		return
	}

	if err := c.validate.Struct(request); err != nil {
		log.Error("failed to validate request", err)
		w.WriteHeader(http.StatusBadRequest)
		render.JSON(w, req, resp.ValidationError(err))
		return
	}

	review := &r.ReviewDTO{
		UserID:     request.UserID,
		FilmID:     request.FilmID,
		Rating:     request.Rating,
		ReviewText: request.ReviewText,
	}

	if err := c.uc.CreateReview(review); err != nil {
		switch {
		case errors.Is(err, r.ErrReviewExists):
			w.WriteHeader(http.StatusBadRequest)
			render.JSON(w, req, resp.Error(r.ErrReviewExists.Error()))
		default:
			log.Error("failed to create review", err)
			w.WriteHeader(http.StatusInternalServerError)
			render.JSON(w, req, resp.Error(r.ErrInternal.Error()))
		}
		return
	}

	w.WriteHeader(http.StatusCreated)
	render.JSON(w, req, resp.OK())
	return
}

// GetReview - Получение отзыва по ID
// @Summary Получение отзыва по ID
// @Description Возвращает информацию о отзыве по указанному ID
// @Tags         review
// @Produce      json
// @Param        id path string true "ID отзыва"
// @Success 200 {object} response.Response
// @Failure 400 {object} response.Response
// @Failure 404 {object} response.Response
// @Failure 500 {object} response.Response
// @Router /reviews/{id} [get]
func (c *ReviewController) GetReview(w http.ResponseWriter, req *http.Request) {
	log := c.log.With("op", "GetReview")

	reviewIDStr := chi.URLParam(req, "id")
	reviewID, err := strconv.ParseUint(reviewIDStr, 10, 32)
	if err != nil {
		w.WriteHeader(http.StatusBadRequest)
		render.JSON(w, req, resp.Error("invalid review ID"))
		return
	}

	review, err := c.uc.GetReview(uint(reviewID))
	if err != nil {
		switch {
		case errors.Is(err, r.ErrNoSuchReview):
			w.WriteHeader(http.StatusNotFound)
			render.JSON(w, req, resp.Error(r.ErrNoSuchReview.Error()))
		default:
			log.Error("failed to get review", err)
			w.WriteHeader(http.StatusInternalServerError)
			render.JSON(w, req, resp.Error(r.ErrInternal.Error()))
		}
		return
	}

	w.WriteHeader(http.StatusOK)
	render.JSON(w, req, resp.Reviews(review))
}

// UpdateReview - Обновление отзыва
// @Summary Обновление отзыва
// @Description Обновляет данные отзыва
// @Tags         review
// @Accept       json
// @Produce      json
// @Param        id path string true "ID отзыва"
// @Param        json body UpdateReviewRequest true "Данные отзыва"
// @Success 200 {object} response.Response
// @Failure 400 {object} response.Response
// @Failure 404 {object} response.Response
// @Failure 500 {object} response.Response
// @Router /reviews/{id} [put]
func (c *ReviewController) UpdateReview(w http.ResponseWriter, req *http.Request) {
	log := c.log.With("op", "UpdateReview")

	reviewIDStr := chi.URLParam(req, "id")
	reviewID, err := strconv.ParseUint(reviewIDStr, 10, 32)
	if err != nil {
		w.WriteHeader(http.StatusBadRequest)
		render.JSON(w, req, resp.Error("invalid review ID"))
		return
	}

	var request UpdateReviewRequest
	if err := render.DecodeJSON(req.Body, &request); err != nil {
		log.Error("failed to decode request body", err)
		w.WriteHeader(http.StatusBadRequest)
		render.JSON(w, req, resp.Error("failed to decode request"))
		return
	}

	if err := c.validate.Struct(request); err != nil {
		log.Error("failed to validate request", err)
		w.WriteHeader(http.StatusBadRequest)
		render.JSON(w, req, resp.ValidationError(err))
		return
	}

	review := &r.ReviewDTO{
		ReviewID:   uint(reviewID), // Используем ID из URL
		UserID:     request.UserID,
		FilmID:     request.FilmID,
		Rating:     request.Rating,
		ReviewText: request.ReviewText,
	}

	if err := c.uc.UpdateReview(review); err != nil {
		switch {
		case errors.Is(err, r.ErrNoSuchReview):
			w.WriteHeader(http.StatusNotFound)
			render.JSON(w, req, resp.Error(r.ErrNoSuchReview.Error()))
		default:
			log.Error("failed to update review", err)
			w.WriteHeader(http.StatusInternalServerError)
			render.JSON(w, req, resp.Error(r.ErrInternal.Error()))
		}
		return
	}

	w.WriteHeader(http.StatusOK)
	render.JSON(w, req, resp.OK())
}

// DeleteReview - Удаление отзыва
// @Summary Удаление отзыва
// @Description Удаляет отзыв по указанному FilmId
// @Tags         review
// @Param        id query string true "FilmId отзыва"
// @Success 200 {object} response.Response
// @Failure 400 {object} response.Response
// @Failure 404 {object} response.Response
// @Failure 500 {object} response.Response
// @Router /reviews/{id} [delete]
func (c *ReviewController) DeleteReview(w http.ResponseWriter, req *http.Request) {
	log := c.log.With("op", "DeleteReview")

	reviewIDStr := chi.URLParam(req, "id")
	reviewID, err := strconv.ParseUint(reviewIDStr, 10, 32)
	if err != nil {
		w.WriteHeader(http.StatusBadRequest)
		render.JSON(w, req, resp.Error("invalid review FilmId"))
		return
	}

	if err := c.uc.DeleteReview(uint(reviewID)); err != nil {
		switch {
		case errors.Is(err, r.ErrNoSuchReview):
			w.WriteHeader(http.StatusNotFound)
			render.JSON(w, req, resp.Error(r.ErrNoSuchReview.Error()))
		default:
			log.Error("failed to delete review", err)
			w.WriteHeader(http.StatusInternalServerError)
			render.JSON(w, req, resp.Error(r.ErrInternal.Error()))
		}
		return
	}

	w.WriteHeader(http.StatusNoContent)
	render.JSON(w, req, resp.OK())
}

// GetReviewsByFilmID - Получение отзывов по FilmId фильма
// @Summary Получение отзывов по FilmId фильма
// @Description Возвращает список отзывов для указанного фильма
// @Tags         review
// @Produce      json
// @Param        film_id query string true "FilmId фильма"
// @Success 200 {array} response.Response
// @Failure 400 {object} response.Response
// @Failure 500 {object} response.Response
// @Router /reviews/film/{film_id} [get]
func (c *ReviewController) GetReviewsByFilmID(w http.ResponseWriter, req *http.Request) {
	log := c.log.With("op", "GetReviewsByFilmID")

	filmIDStr := chi.URLParam(req, "film_id")
	filmID, err := strconv.ParseUint(filmIDStr, 10, 32)
	if err != nil {
		w.WriteHeader(http.StatusBadRequest)
		render.JSON(w, req, resp.Error("invalid film FilmId"))
		return
	}

	reviews, err := c.uc.GetReviewsByFilmID(uint(filmID))
	if err != nil {
		log.Error("failed to get reviews by film FilmId", err)
		w.WriteHeader(http.StatusInternalServerError)
		render.JSON(w, req, resp.Error(r.ErrInternal.Error()))
		return
	}

	w.WriteHeader(http.StatusOK)
	render.JSON(w, req, resp.Reviews(reviews))
}

// GetReviewsByReviewerID - Получение отзывов текущего пользователя
// @Summary Получение отзывов текущего пользователя
// @Description Возвращает список отзывов, оставленных текущим пользователем
// @Tags         review
// @Produce      json
// @Success 200 {array} response.Response
// @Failure 500 {object} response.Response
// @Router /reviews/user [get]
func (c *ReviewController) GetReviewsByReviewerID(w http.ResponseWriter, req *http.Request) {
	log := c.log.With("op", "GetReviewsByReviewerID")

	// Получаем userId из контекста
	userID := req.Context().Value("userId").(uint)

	reviews, err := c.uc.GetReviewsByReviewerID(userID)
	if err != nil {
		log.Error("failed to get reviews by reviewer FilmId", err)
		w.WriteHeader(http.StatusInternalServerError)
		render.JSON(w, req, resp.Error(r.ErrInternal.Error()))
		return
	}

	w.WriteHeader(http.StatusOK)
	render.JSON(w, req, resp.Reviews(reviews))
}

// AdminCreateReview - Создание отзыва администратором
// @Summary Создание отзыва администратором
// @Description Создает отзыв от имени любого пользователя
// @Tags         admin/review
// @Accept       json
// @Produce      json
// @Param        json body CreateReviewRequest true "Данные отзыва"
// @Success 201 {object} response.Response
// @Failure 400 {object} response.Response
// @Failure 500 {object} response.Response
// @Router /admin/reviews [post]
func (c *ReviewController) AdminCreateReview(w http.ResponseWriter, req *http.Request) {
	log := c.log.With("op", "AdminCreateReview")

	var request CreateReviewRequest
	if err := render.DecodeJSON(req.Body, &request); err != nil {
		log.Error("failed to decode request body", err)
		w.WriteHeader(http.StatusBadRequest)
		render.JSON(w, req, resp.Error("failed to decode request"))
		return
	}

	if err := c.validate.Struct(request); err != nil {
		log.Error("failed to validate request", err)
		w.WriteHeader(http.StatusBadRequest)
		render.JSON(w, req, resp.ValidationError(err))
		return
	}

	review := &r.ReviewDTO{
		UserID:     request.UserID, // Администратор может указать любой UserID
		FilmID:     request.FilmID,
		Rating:     request.Rating,
		ReviewText: request.ReviewText,
	}

	if err := c.uc.CreateReview(review); err != nil {
		switch {
		case errors.Is(err, r.ErrReviewExists):
			w.WriteHeader(http.StatusBadRequest)
			render.JSON(w, req, resp.Error(r.ErrReviewExists.Error()))
		default:
			log.Error("failed to create review", err)
			w.WriteHeader(http.StatusInternalServerError)
			render.JSON(w, req, resp.Error(r.ErrInternal.Error()))
		}
		return
	}

	w.WriteHeader(http.StatusCreated)
	render.JSON(w, req, resp.OK())
}

// AdminUpdateReview - Обновление отзыва администратором
// @Summary Обновление отзыва администратором
// @Description Обновляет любой отзыв в системе
// @Tags         admin/review
// @Accept       json
// @Produce      json
// @Param        json body UpdateReviewRequest true "Данные отзыва"
// @Success 200 {object} response.Response
// @Failure 400 {object} response.Response
// @Failure 404 {object} response.Response
// @Failure 500 {object} response.Response
// @Router /admin/reviews [put]
func (c *ReviewController) AdminUpdateReview(w http.ResponseWriter, req *http.Request) {
	log := c.log.With("op", "AdminUpdateReview")

	var request UpdateReviewRequest
	if err := render.DecodeJSON(req.Body, &request); err != nil {
		log.Error("failed to decode request body", err)
		w.WriteHeader(http.StatusBadRequest)
		render.JSON(w, req, resp.Error("failed to decode request"))
		return
	}

	if err := c.validate.Struct(request); err != nil {
		log.Error("failed to validate request", err)
		w.WriteHeader(http.StatusBadRequest)
		render.JSON(w, req, resp.ValidationError(err))
		return
	}

	review := &r.ReviewDTO{
		ReviewID:   request.ReviewID,
		UserID:     request.UserID, // Администратор может обновить отзыв любого пользователя
		FilmID:     request.FilmID,
		Rating:     request.Rating,
		ReviewText: request.ReviewText,
	}

	if err := c.uc.UpdateReview(review); err != nil {
		switch {
		case errors.Is(err, r.ErrNoSuchReview):
			w.WriteHeader(http.StatusNotFound)
			render.JSON(w, req, resp.Error(r.ErrNoSuchReview.Error()))
		default:
			log.Error("failed to update review", err)
			w.WriteHeader(http.StatusInternalServerError)
			render.JSON(w, req, resp.Error(r.ErrInternal.Error()))
		}
		return
	}

	w.WriteHeader(http.StatusOK)
	render.JSON(w, req, resp.OK())
}

// AdminDeleteReview - Удаление отзыва администратором
// @Summary Удаление отзыва администратором
// @Description Удаляет любой отзыв в системе
// @Tags         admin/review
// @Param        id query string true "ID отзыва"
// @Success 200 {object} response.Response
// @Failure 400 {object} response.Response
// @Failure 404 {object} response.Response
// @Failure 500 {object} response.Response
// @Router /admin/reviews/{id} [delete]
func (c *ReviewController) AdminDeleteReview(w http.ResponseWriter, req *http.Request) {
	log := c.log.With("op", "AdminDeleteReview")

	reviewIDStr := chi.URLParam(req, "id")
	reviewID, err := strconv.ParseUint(reviewIDStr, 10, 32)
	if err != nil {
		w.WriteHeader(http.StatusBadRequest)
		render.JSON(w, req, resp.Error("invalid review ID"))
		return
	}

	if err := c.uc.DeleteReview(uint(reviewID)); err != nil {
		switch {
		case errors.Is(err, r.ErrNoSuchReview):
			w.WriteHeader(http.StatusNotFound)
			render.JSON(w, req, resp.Error(r.ErrNoSuchReview.Error()))
		default:
			log.Error("failed to delete review", err)
			w.WriteHeader(http.StatusInternalServerError)
			render.JSON(w, req, resp.Error(r.ErrInternal.Error()))
		}
		return
	}

	w.WriteHeader(http.StatusNoContent)
	render.JSON(w, req, resp.OK())
}

// AdminGetAllReviews - Получение всех отзывов администратором
// @Summary Получение всех отзывов администратором
// @Description Возвращает все отзывы в системе
// @Tags         admin/review
// @Produce      json
// @Success 200 {array} response.Response
// @Failure 500 {object} response.Response
// @Router /admin/reviews [get]
func (c *ReviewController) AdminGetAllReviews(w http.ResponseWriter, req *http.Request) {
	log := c.log.With("op", "AdminGetAllReviews")

	reviews, err := c.uc.GetAllReviews()
	if err != nil {
		log.Error("failed to get all reviews", err)
		w.WriteHeader(http.StatusInternalServerError)
		render.JSON(w, req, resp.Error(r.ErrInternal.Error()))
		return
	}

	w.WriteHeader(http.StatusOK)
	render.JSON(w, req, resp.Reviews(reviews))
}
