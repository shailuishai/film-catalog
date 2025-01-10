package controller

import (
	"errors"
	"github.com/go-chi/chi/v5"
	"github.com/go-chi/render"
	"github.com/go-playground/validator/v10"
	"log/slog"
	"net/http"
	g "server/internal/modules/genre"
	resp "server/pkg/lib/response"
	"strconv"
)

type GenreController struct {
	log      *slog.Logger
	uc       g.UseCase
	validate *validator.Validate
}

func NewGenreController(log *slog.Logger, uc g.UseCase) *GenreController {
	validate := validator.New()

	return &GenreController{
		log:      log,
		uc:       uc,
		validate: validate,
	}
}

// CreateGenre - Создание нового жанра
// @Summary Создание нового жанра
// @Description Создает новый жанр с указанным названием
// @Tags         genre
// @Accept       json
// @Produce      json
// @Param        json body CreateGenreRequest true "Название жанра"
// @Success 201 {object} response.Response
// @Failure 400 {object} response.Response
// @Failure 500 {object} response.Response
// @Router /genres [post]
func (c *GenreController) CreateGenre(w http.ResponseWriter, r *http.Request) {
	log := c.log.With("op", "CreateGenre")

	var req CreateGenreRequest

	if err := render.DecodeJSON(r.Body, &req); err != nil {
		log.Error("failed to decode request body", err)
		w.WriteHeader(http.StatusBadRequest)
		render.JSON(w, r, resp.Error("failed to decode request"))
		return
	}

	if err := c.validate.Struct(req); err != nil {
		log.Error("failed to validate request", err)
		w.WriteHeader(http.StatusBadRequest)
		render.JSON(w, r, resp.ValidationError(err))
		return
	}

	if _, err := c.uc.CreateGenre(req.Name); err != nil {
		switch {
		case errors.Is(err, g.ErrGenreExists):
			w.WriteHeader(http.StatusBadRequest)
			render.JSON(w, r, resp.Error(g.ErrGenreExists.Error()))
		default:
			log.Error("failed to create genre", err)
			w.WriteHeader(http.StatusInternalServerError)
			render.JSON(w, r, resp.Error(g.ErrInternalServer.Error()))
		}
		return
	}

	w.WriteHeader(http.StatusCreated)
	render.JSON(w, r, resp.OK())
	return
}

// UpdateGenre - Обновление жанра
// @Summary Обновление жанра
// @Description Обновляет название существующего жанра
// @Tags         genre
// @Accept       json
// @Produce      json
// @Param        json body UpdateGenreRequest true "FilmId жанра и новое название"
// @Success 200 {object} response.Response
// @Failure 400 {object} response.Response
// @Failure 500 {object} response.Response
// @Router /genres [put]
func (c *GenreController) UpdateGenre(w http.ResponseWriter, r *http.Request) {
	log := c.log.With("op", "UpdateGenre")

	var req UpdateGenreRequest

	if err := render.DecodeJSON(r.Body, &req); err != nil {
		log.Error("failed to decode request body", err)
		w.WriteHeader(http.StatusBadRequest)
		render.JSON(w, r, resp.Error("failed to decode request"))
	}

	if err := c.validate.Struct(req); err != nil {
		log.Error("failed to validate request", err)
		w.WriteHeader(http.StatusBadRequest)
		render.JSON(w, r, resp.ValidationError(err))
	}

	if err := c.uc.UpdateGenre(req.GenreId, req.Name); err != nil {
		switch {
		case errors.Is(err, g.ErrNoSuchGenre):
			w.WriteHeader(http.StatusBadRequest)
			render.JSON(w, r, resp.Error(g.ErrNoSuchGenre.Error()))
		default:
			log.Error("failed to update genre", err)
			w.WriteHeader(http.StatusInternalServerError)
			render.JSON(w, r, resp.Error(g.ErrInternalServer.Error()))
		}
		return
	}

	w.WriteHeader(http.StatusOK)
	render.JSON(w, r, resp.OK())
	return
}

// GetGenres - Получение списка жанров
// @Summary Получение списка жанров
// @Description Возвращает список всех доступных жанров
// @Tags         genre
// @Produce      json
// @Success 200 {array} response.Response
// @Failure 500 {object} response.Response
// @Router /genres [get]
func (c *GenreController) GetGenres(w http.ResponseWriter, r *http.Request) {
	log := c.log.With("op", "GetGenres")

	genres, err := c.uc.GetGenres()
	if err != nil {
		switch {
		case errors.Is(err, g.ErrNoSuchGenre):
			w.WriteHeader(http.StatusBadRequest)
			render.JSON(w, r, resp.Error(g.ErrNoSuchGenre.Error()))
		default:
			log.Error("failed to get genres", err)
			w.WriteHeader(http.StatusInternalServerError)
			render.JSON(w, r, resp.Error(g.ErrInternalServer.Error()))
		}
		return
	}

	w.WriteHeader(http.StatusOK)
	render.JSON(w, r, resp.Genres(genres))
	return
}

// GetGenre - Получение информации о жанре
// @Summary Получение жанра по FilmId
// @Description Возвращает информацию о жанре по указанному FilmId
// @Tags         genre
// @Produce      json
// @Param        id query string true "FilmId жанра"
// @Success 200 {object} response.Response
// @Failure 400 {object} response.Response
// @Failure 404 {object} response.Response
// @Failure 500 {object} response.Response
// @Router /genres/{id} [get]
func (c *GenreController) GetGenre(w http.ResponseWriter, r *http.Request) {
	log := c.log.With("op", "GetGenre")

	genreIdStr := r.URL.Query().Get("id")

	genreIdUint64, err := strconv.ParseUint(genreIdStr, 10, 32)
	if err != nil {
		w.WriteHeader(http.StatusBadRequest)
		render.JSON(w, r, resp.Error("invalid actor id"))
		return
	}

	genreId := uint(genreIdUint64)

	genre, err := c.uc.GetGenre(genreId)
	if err != nil {
		switch {
		case errors.Is(err, g.ErrNoSuchGenre):
			w.WriteHeader(http.StatusBadRequest)
			render.JSON(w, r, resp.Error(g.ErrNoSuchGenre.Error()))
		default:
			log.Error("failed to get genre", err)
			w.WriteHeader(http.StatusInternalServerError)
			render.JSON(w, r, resp.Error(g.ErrInternalServer.Error()))
		}
		return
	}

	w.WriteHeader(http.StatusOK)
	render.JSON(w, r, resp.Genres(genre))
	return
}

// DeleteGenre - Удаление жанра
// @Summary Удаление жанра
// @Description Удаляет жанр по указанному FilmId
// @Tags         genre
// @Param        id query string true "FilmId жанра"
// @Success 200 {object} response.Response
// @Failure 400 {object} response.Response
// @Failure 404 {object} response.Response
// @Failure 500 {object} response.Response
// @Router /genres/{id} [delete]
func (c *GenreController) DeleteGenre(w http.ResponseWriter, r *http.Request) {
	log := c.log.With("op", "DeleteGenre")

	genreIdStr := chi.URLParam(r, "id")

	genreIdUint64, err := strconv.ParseUint(genreIdStr, 10, 32)
	if err != nil {
		w.WriteHeader(http.StatusBadRequest)
		render.JSON(w, r, resp.Error("invalid genre id"))
		return
	}

	genreId := uint(genreIdUint64)

	if err := c.uc.DeleteGenre(genreId); err != nil {
		switch {
		case errors.Is(err, g.ErrNoSuchGenre):
			w.WriteHeader(http.StatusBadRequest)
			render.JSON(w, r, resp.Error(g.ErrNoSuchGenre.Error()))
		default:
			log.Error("failed to delete genre", err)
			w.WriteHeader(http.StatusInternalServerError)
			render.JSON(w, r, resp.Error(g.ErrInternalServer.Error()))
		}
		return
	}

	w.WriteHeader(http.StatusNoContent)
	render.JSON(w, r, resp.OK())
	return
}
