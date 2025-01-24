package controller

import (
	"encoding/json"
	"errors"
	"github.com/go-chi/chi/v5"
	"github.com/go-chi/render"
	"github.com/go-playground/validator/v10"
	"gorm.io/gorm"
	"log/slog"
	"net/http"
	f "server/internal/modules/film"
	"server/pkg/lib"
	resp "server/pkg/lib/response"
	"strconv"
	"time"
)

type Controller struct {
	log         *slog.Logger
	filmUseCase f.UseCase
	validate    *validator.Validate
}

func NewFilmController(log *slog.Logger, filmUseCase f.UseCase) f.Controller {
	validation := validator.New()
	validation.RegisterValidation("runtime_format", validateRuntimeFormat)
	return &Controller{
		filmUseCase: filmUseCase,
		log:         log,
		validate:    validation,
	}
}

// GetFilmByID - Получение фильма по FilmId
// @Summary Получить фильм по FilmId
// @Description Возвращает информацию о фильме по его FilmId
// @Tags film
// @Param id path string true "FilmId фильма"
// @Success 200 {object} response.Response
// @Failure 400 {object} response.Response
// @Failure 404 {object} response.Response
// @Failure 500 {object} response.Response
// @Router /films/{id} [get]
func (c *Controller) GetFilmByID(w http.ResponseWriter, r *http.Request) {
	log := c.log.With("method", "GetFilmByID")

	id, err := strToUint(chi.URLParam(r, "id"))
	if err != nil {
		w.WriteHeader(http.StatusBadRequest)
		render.JSON(w, r, resp.Error("invalid id"))
		return
	}

	film, err := c.filmUseCase.GetFilmByID(id)
	if err != nil {
		switch {
		case errors.Is(err, gorm.ErrRecordNotFound):
			w.WriteHeader(http.StatusNotFound)
			render.JSON(w, r, resp.Error(f.ErrFilmNotFound.Error()))
		default:
			log.Error("failed get film", "error", err)
			w.WriteHeader(http.StatusInternalServerError)
			render.JSON(w, r, resp.Error(f.ErrInternal.Error()))
		}
		return
	}

	w.WriteHeader(http.StatusOK)
	render.JSON(w, r, resp.Films(film))
	return
}

// CreateFilm - Создание нового фильма
// @Summary Создать новый фильм
// @Description Создает новый фильм с указанными параметрами
// @Tags film
// @Accept multipart/form-data
// @Produce json
// @Param data formData string true "Данные фильма в формате JSON"
// @Param poster formData file false "Постер фильма"
// @Success 201 {object} response.Response
// @Failure 400 {object} response.Response
// @Failure 409 {object} response.Response
// @Failure 500 {object} response.Response
// @Router /films [post]
func (c *Controller) CreateFilm(w http.ResponseWriter, r *http.Request) {
	log := c.log.With("method", "CreateFilm")

	if err := r.ParseMultipartForm(5 << 20); err != nil {
		w.WriteHeader(http.StatusBadRequest)
		render.JSON(w, r, resp.Error("unable to parse form"))
		return
	}

	jsonData := r.FormValue("data")
	if jsonData == "" {
		w.WriteHeader(http.StatusBadRequest)
		render.JSON(w, r, resp.Error("missing JSON data"))
		return
	}

	var req CreateFilmRequest
	if err := json.Unmarshal([]byte(jsonData), &req); err != nil {
		log.Error("failed to unmarshal json", "error", err)
		w.WriteHeader(http.StatusBadRequest)
		render.JSON(w, r, resp.Error("invalid JSON data"))
		return
	}

	req.Sanitize()

	if err := c.validate.Struct(req); err != nil {
		w.WriteHeader(http.StatusBadRequest)
		render.JSON(w, r, resp.ValidationError(err))
		return
	}

	file, _, err := r.FormFile("poster")
	switch {
	case errors.Is(err, http.ErrMissingFile):
		log.Info("file is missing")
		file = nil
	case err != nil:
		log.Error("failed to get file from form", err)
		w.WriteHeader(http.StatusBadRequest)
		render.JSON(w, r, resp.Error("failed to get file from form"))
	default:
		defer func() {
			if file != nil {
				if err := file.Close(); err != nil {
					log.Error("failed to close avatar file", err)
				}
			}
		}()
	}

	releaseDate, err := time.Parse("2006-01-02", req.ReleaseDate)
	if err != nil {
		w.WriteHeader(http.StatusBadRequest)
		render.JSON(w, r, resp.Error("invalid release_date"))
		return
	}

	filmDTO := &f.FilmDTO{
		Title:       req.Title,
		Synopsis:    req.Synopsis,
		ReleaseDate: releaseDate,
		Runtime:     req.Runtime,
		Producer:    req.Producer,
		GenreIDs:    req.GenreIDs,
		ActorIDs:    req.ActorIDs,
		CreateAt:    time.Now(),
	}

	if err := c.filmUseCase.CreateFilm(filmDTO, &file); err != nil {
		switch {
		case errors.Is(err, f.ErrInvalidFilmData):
			w.WriteHeader(http.StatusBadRequest)
			render.JSON(w, r, resp.Error(f.ErrInvalidFilmData.Error()))
		case errors.Is(err, f.ErrFilmAlreadyExists):
			w.WriteHeader(http.StatusConflict)
			render.JSON(w, r, resp.Error(f.ErrFilmAlreadyExists.Error()))
		case errors.Is(err, f.ErrGenreNotFound):
			w.WriteHeader(http.StatusBadRequest)
			render.JSON(w, r, resp.Error(f.ErrGenreNotFound.Error()))
		case errors.Is(err, f.ErrActorNotFound):
			w.WriteHeader(http.StatusBadRequest)
			render.JSON(w, r, resp.Error(f.ErrActorNotFound.Error()))
		default:
			w.WriteHeader(http.StatusInternalServerError)
			render.JSON(w, r, resp.Error(f.ErrInternal.Error()))
		}
		return
	}

	w.WriteHeader(http.StatusCreated)
	render.JSON(w, r, resp.OK())
	return
}

// UpdateFilm - Обновление информации о фильме
// @Summary Обновить информацию о фильме
// @Description Обновляет данные фильма, включая постер
// @Tags film
// @Accept multipart/form-data
// @Produce json
// @Param id path string true "FilmId фильма"
// @Param data formData string true "Данные фильма в формате JSON"
// @Param poster formData file false "Постер фильма"
// @Success 200 {object} response.Response
// @Failure 400 {object} response.Response
// @Failure 404 {object} response.Response
// @Failure 500 {object} response.Response
// @Router /films/{id} [put]
func (c *Controller) UpdateFilm(w http.ResponseWriter, r *http.Request) {
	log := c.log.With("method", "UpdateFilm")

	id, err := strToUint(chi.URLParam(r, "id"))
	if err != nil {
		w.WriteHeader(http.StatusBadRequest)
		render.JSON(w, r, resp.Error("invalid id"))
		return
	}

	if err := r.ParseMultipartForm(5 << 20); err != nil {
		w.WriteHeader(http.StatusBadRequest)
		render.JSON(w, r, resp.Error("unable to parse form"))
		return
	}

	jsonData := r.FormValue("data")
	if jsonData == "" {
		w.WriteHeader(http.StatusBadRequest)
		render.JSON(w, r, resp.Error("missing JSON data"))
		return
	}

	var req CreateFilmRequest
	if err := json.Unmarshal([]byte(jsonData), &req); err != nil {
		w.WriteHeader(http.StatusBadRequest)
		render.JSON(w, r, resp.Error("invalid JSON data"))
		return
	}

	req.Sanitize()

	if err := c.validate.Struct(req); err != nil {
		w.WriteHeader(http.StatusBadRequest)
		render.JSON(w, r, resp.ValidationError(err))
		return
	}

	file, _, err := r.FormFile("poster")
	switch {
	case errors.Is(err, http.ErrMissingFile):
		log.Info("file is missing")
		file = nil
	case err != nil:
		log.Error("failed to get file from form", err)
		w.WriteHeader(http.StatusBadRequest)
		render.JSON(w, r, resp.Error("failed to get file from form"))
	default:
		defer func() {
			if file != nil {
				if err := file.Close(); err != nil {
					log.Error("failed to close poster file", err)
				}
			}
		}()
	}

	releaseDate, err := time.Parse("2006-01-02", req.ReleaseDate)
	if err != nil {
		w.WriteHeader(http.StatusBadRequest)
		render.JSON(w, r, resp.Error("invalid release_date"))
		return
	}

	filmDTO := &f.FilmDTO{
		ID:           id,
		Title:        req.Title,
		Synopsis:     req.Synopsis,
		ReleaseDate:  releaseDate,
		Runtime:      req.Runtime,
		Producer:     req.Producer,
		GenreIDs:     req.GenreIDs,
		ActorIDs:     req.ActorIDs,
		RemovePoster: req.RemovePoster,
	}

	if err := c.filmUseCase.UpdateFilm(filmDTO, &file); err != nil {
		switch {
		case errors.Is(err, f.ErrFilmNotFound) || errors.Is(err, f.ErrInvalidFilmData) || errors.Is(err, f.ErrGenreNotFound) ||
			errors.Is(err, f.ErrActorNotFound) || errors.Is(err, f.ErrFilmPosterNotFound):
			w.WriteHeader(http.StatusNotFound)
			render.JSON(w, r, resp.Error(err.Error()))
		default:
			log.Error("failed to update film", "error", err)
			w.WriteHeader(http.StatusInternalServerError)
			render.JSON(w, r, resp.Error(f.ErrInternal.Error()))
		}
		return
	}

	w.WriteHeader(http.StatusOK)
	render.JSON(w, r, resp.OK())
	return
}

// DeleteFilm - Удаление фильма
// @Summary Удалить фильм по FilmId
// @Description Удаляет фильм по его FilmId
// @Tags film
// @Param id path string true "FilmId фильма"
// @Success 204 {object} response.Response
// @Failure 404 {object} response.Response
// @Failure 500 {object} response.Response
// @Router /films/{id} [delete]
func (c *Controller) DeleteFilm(w http.ResponseWriter, r *http.Request) {
	log := c.log.With("method", "DeleteFilm")

	id, err := strToUint(chi.URLParam(r, "id"))
	if err != nil {
		w.WriteHeader(http.StatusBadRequest)
		render.JSON(w, r, resp.Error("invalid id"))
		return
	}

	if err := c.filmUseCase.DeleteFilm(id); err != nil {
		switch {
		case errors.Is(err, f.ErrFilmNotFound):
			w.WriteHeader(http.StatusNotFound)
			render.JSON(w, r, resp.Error(f.ErrFilmNotFound.Error()))
		default:
			log.Error("failed to delete film", "error", err)
			w.WriteHeader(http.StatusInternalServerError)
			render.JSON(w, r, resp.Error(f.ErrInternal.Error()))
		}
		return
	}

	w.WriteHeader(http.StatusNoContent)
	render.JSON(w, r, resp.OK())
	return
}

// SearchFilms - Поиск фильмов
// @Summary Поиск фильмов по запросу
// @Description Возвращает список фильмов, соответствующих поисковому запросу
// @Tags film
// @Param query query string true "Поисковый запрос"
// @Success 200 {array} response.Response
// @Failure 400 {object} response.Response
// @Failure 500 {object} response.Response
// @Router /films/search [get]
func (c *Controller) SearchFilms(w http.ResponseWriter, r *http.Request) {
	log := c.log.With("method", "SearchFilms")

	query := r.URL.Query().Get("query")
	if query == "" {
		w.WriteHeader(http.StatusBadRequest)
		render.JSON(w, r, resp.Error("query parameter is required"))
		return
	}

	films, err := c.filmUseCase.SearchFilms(query)
	if err != nil {
		switch {
		case errors.Is(err, f.ErrFilmSearchFailed):
			w.WriteHeader(http.StatusInternalServerError)
			render.JSON(w, r, resp.Error(f.ErrFilmSearchFailed.Error()))
		default:
			log.Error("failed to search films", "error", err)
			w.WriteHeader(http.StatusInternalServerError)
			render.JSON(w, r, resp.Error(f.ErrInternal.Error()))
		}
		return
	}

	w.WriteHeader(http.StatusOK)
	render.JSON(w, r, resp.Films(films))
	return
}

// GetFilms - Получение списка фильмов с фильтрацией и пагинацией
// @Summary Получить список фильмов с фильтрацией и пагинацией
// @Description Возвращает список фильмов с возможностью фильтрации по жанрам, актерам, продюсеру, рейтингу, дате выпуска, длительности и сортировке
// @Tags film
// @Param genre_ids query []uint false "Список FilmId жанров"
// @Param actor_ids query []uint false "Список FilmId актеров"
// @Param producer query string false "Продюсер"
// @Param min_rating query float64 false "Минимальный рейтинг"
// @Param max_rating query float64 false "Максимальный рейтинг"
// @Param min_date query string false "Минимальная дата выпуска (формат: 2006-01-02)"
// @Param max_date query string false "Максимальная дата выпуска (формат: 2006-01-02)"
// @Param min_duration query string false "Минимальная длительность (пример: 2h30m, 90m)"
// @Param max_duration query string false "Максимальная длительность (пример: 2h30m, 90m)"
// @Param sort_by query string false "Поле для сортировки (rating, release_date, runtime)"
// @Param order query string false "Порядок сортировки (asc, desc)"
// @Param page query int false "Номер страницы"
// @Param page_size query int false "Размер страницы"
// @Success 200 {array} response.Response
// @Failure 400 {object} response.Response
// @Failure 500 {object} response.Response
// @Router /films [get]
func (c *Controller) GetFilms(w http.ResponseWriter, r *http.Request) {
	log := c.log.With("method", "GetFilms")

	filters := f.FilmFilters{}

	if genreIDs := r.URL.Query().Get("genre_ids"); genreIDs != "" {
		ids, err := lib.StrToUintSlice(genreIDs)
		if err != nil {
			w.WriteHeader(http.StatusBadRequest)
			render.JSON(w, r, resp.Error("invalid genre_ids format"))
			return
		}
		filters.GenreIDs = ids
	}

	if actorIDs := r.URL.Query().Get("actor_ids"); actorIDs != "" {
		ids, err := lib.StrToUintSlice(actorIDs)
		if err != nil {
			w.WriteHeader(http.StatusBadRequest)
			render.JSON(w, r, resp.Error("invalid actor_ids format"))
			return
		}
		filters.ActorIDs = ids
	}

	if producer := r.URL.Query().Get("producer"); producer != "" {
		filters.Producer = producer
	}

	if minRating := r.URL.Query().Get("min_rating"); minRating != "" {
		rating, err := strToFloat(minRating)
		if err != nil {
			w.WriteHeader(http.StatusBadRequest)
			render.JSON(w, r, resp.Error("invalid min_rating format"))
			return
		}
		filters.MinRating = rating
	}

	if maxRating := r.URL.Query().Get("max_rating"); maxRating != "" {
		rating, err := strToFloat(maxRating)
		if err != nil {
			w.WriteHeader(http.StatusBadRequest)
			render.JSON(w, r, resp.Error("invalid max_rating format"))
			return
		}
		filters.MaxRating = rating
	}

	if minDate := r.URL.Query().Get("min_date"); minDate != "" {
		date, err := strToTime(minDate)
		if err != nil {
			w.WriteHeader(http.StatusBadRequest)
			render.JSON(w, r, resp.Error("invalid min_date format, expected RFC3339"))
			return
		}
		filters.MinDate = date
	}

	if maxDate := r.URL.Query().Get("max_date"); maxDate != "" {
		date, err := strToTime(maxDate)
		if err != nil {
			w.WriteHeader(http.StatusBadRequest)
			render.JSON(w, r, resp.Error("invalid max_date format, expected RFC3339"))
			return
		}
		filters.MaxDate = date
	}

	if minDuration := r.URL.Query().Get("min_duration"); minDuration != "" {
		filters.MinDuration = minDuration
	}

	if maxDuration := r.URL.Query().Get("max_duration"); maxDuration != "" {
		filters.MaxDuration = maxDuration
	}

	if page := r.URL.Query().Get("page"); page != "" {
		pageNum, err := strconv.Atoi(page)
		if err != nil || pageNum < 1 {
			w.WriteHeader(http.StatusBadRequest)
			render.JSON(w, r, resp.Error("invalid page format, expected positive integer"))
			return
		}
		filters.Page = pageNum
	}

	if pageSize := r.URL.Query().Get("page_size"); pageSize != "" {
		size, err := strconv.Atoi(pageSize)
		if err != nil || size < 1 || size > 100 {
			w.WriteHeader(http.StatusBadRequest)
			render.JSON(w, r, resp.Error("invalid page_size format, expected positive integer between 1 and 100"))
			return
		}
		filters.PageSize = size
	}

	if err := c.validate.Struct(filters); err != nil {
		w.WriteHeader(http.StatusBadRequest)
		render.JSON(w, r, resp.ValidationError(err))
		return
	}

	sort := f.FilmSort{
		By:    r.URL.Query().Get("sort_by"),
		Order: r.URL.Query().Get("order"),
	}

	if err := c.validate.Struct(sort); err != nil {
		w.WriteHeader(http.StatusBadRequest)
		render.JSON(w, r, resp.ValidationError(err))
		return
	}

	films, err := c.filmUseCase.GetFilms(filters, sort)
	if err != nil {
		log.Error("failed to get films", "error", err)
		w.WriteHeader(http.StatusInternalServerError)
		render.JSON(w, r, resp.Error(f.ErrInternal.Error()))
		return
	}

	w.WriteHeader(http.StatusOK)
	render.JSON(w, r, resp.Films(films))
}

// AdminGetAllFilms - Получение всех фильмов для администратора
// @Summary Получить все фильмы для администратора
// @Description Возвращает список всех фильмов с возможностью пагинации
// @Tags admin
// @Param page query int false "Номер страницы"
// @Param page_size query int false "Размер страницы"
// @Success 200 {array} response.Response
// @Failure 500 {object} response.Response
// @Router /admin/films [get]
func (c *Controller) AdminGetAllFilms(w http.ResponseWriter, r *http.Request) {
	log := c.log.With("method", "AdminGetAllFilms")

	page, err := strconv.Atoi(r.URL.Query().Get("page"))
	if err != nil || page < 1 {
		page = 1
	}

	pageSize, err := strconv.Atoi(r.URL.Query().Get("page_size"))
	if err != nil || pageSize < 1 || pageSize > 100 {
		pageSize = 10
	}

	films, err := c.filmUseCase.GetAllFilmsWithDetails(page, pageSize)
	if err != nil {
		log.Error("failed to get films", "error", err)
		w.WriteHeader(http.StatusInternalServerError)
		render.JSON(w, r, resp.Error(f.ErrInternal.Error()))
		return
	}

	w.WriteHeader(http.StatusOK)
	render.JSON(w, r, resp.Films(films))
}

// AdminMultiDeleteFilms - Удаление нескольких фильмов
// @Summary Удалить несколько фильмов
// @Description Удаляет несколько фильмов по их FilmId
// @Tags admin
// @Param ids query []uint true "Список FilmId фильмов"
// @Success 204 {object} response.Response
// @Failure 400 {object} response.Response
// @Failure 500 {object} response.Response
// @Router /admin/films [delete]
func (c *Controller) AdminMultiDeleteFilms(w http.ResponseWriter, r *http.Request) {
	log := c.log.With("method", "AdminMultiDeleteFilms")

	ids := r.URL.Query().Get("ids")
	if ids == "" {
		w.WriteHeader(http.StatusBadRequest)
		render.JSON(w, r, resp.Error("ids parameter is required"))
		return
	}

	idsSlice, err := lib.StrToUintSlice(ids)
	if err != nil {
		w.WriteHeader(http.StatusBadRequest)
		render.JSON(w, r, resp.Error("invalid ids format"))
		return
	}

	if err := c.filmUseCase.DeleteFilms(idsSlice); err != nil {
		log.Error("failed to delete films", "error", err)
		w.WriteHeader(http.StatusInternalServerError)
		render.JSON(w, r, resp.Error(f.ErrInternal.Error()))
		return
	}

	w.WriteHeader(http.StatusNoContent)
	render.JSON(w, r, resp.OK())
}

func strToUint(s string) (uint, error) {
	val, err := strconv.ParseUint(s, 10, 64)
	if err != nil {
		return 0, err
	}
	return uint(val), nil
}

func strToFloat(s string) (float64, error) {
	val, err := strconv.ParseFloat(s, 64)
	if err != nil {
		return 0, err
	}
	return val, nil
}

func strToTime(s string) (time.Time, error) {
	return time.Parse("2006-01-02", s)
}
