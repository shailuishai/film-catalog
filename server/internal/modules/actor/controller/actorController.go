package controller

import (
	"encoding/json"
	"errors"
	"github.com/go-chi/chi/v5"
	"github.com/go-chi/render"
	"github.com/go-playground/validator/v10"
	"log/slog"
	"net/http"
	act "server/internal/modules/actor"
	u "server/internal/modules/user"
	resp "server/pkg/lib/response"
	"strconv"
	"strings"
)

type ActorController struct {
	log      *slog.Logger
	uc       act.UseCase
	validate *validator.Validate
}

func NewActorController(log *slog.Logger, uc act.UseCase) *ActorController {
	validate := validator.New()
	validate.RegisterValidation("wikipedia", func(fl validator.FieldLevel) bool {
		url := fl.Field().String()
		return strings.Contains(url, "wikipedia.org")
	})
	return &ActorController{
		log:      log,
		uc:       uc,
		validate: validate,
	}
}

// CreateActor - Создание нового актера
// @Summary Создание нового актера
// @Description Создает нового актера с указанными параметрами
// @Tags         actor
// @Accept json
// @Produce json
// @Param json   formData  string true "Данные актера"
// @Param avatar formData file false "Аватар актера"
// @Success 201 {object} response.Response
// @Failure 400 {object} response.Response
// @Failure 413 {object} response.Response
// @Failure 500 {object} response.Response
// @Router /actors [post]
func (c *ActorController) CreateActor(w http.ResponseWriter, r *http.Request) {
	log := c.log.With("op", "controller create actor")

	if err := r.ParseMultipartForm(1 << 20); err != nil {
		if err.Error() == "http: request body too large" {
			log.Error("request body exceeds maximum allowed size")
			w.WriteHeader(http.StatusRequestEntityTooLarge)
			render.JSON(w, r, resp.Error(u.ErrInvalidSizeAvatar.Error()))
			return
		}
		log.Error("failed to parse multipart form", err)
		w.WriteHeader(http.StatusBadRequest)
		render.JSON(w, r, resp.Error("invalid multipart form"))
		return
	}

	var req CreateActorRequest

	jsonData := r.FormValue("json")
	if err := json.Unmarshal([]byte(jsonData), &req); err != nil {
		log.Error("failed to decode JSON part", err)
		w.WriteHeader(http.StatusBadRequest)
		render.JSON(w, r, resp.Error("invalid JSON part"))
		return
	}

	if err := c.validate.Struct(req); err != nil {
		log.Info("failed to validate request data", err)
		w.WriteHeader(http.StatusBadRequest)
		render.JSON(w, r, resp.ValidationError(err))
		return
	}

	file, _, err := r.FormFile("avatar")
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

	actorDTO := &act.ActorDTO{
		Name:    req.Name,
		WikiUrl: req.WikiUrl,
	}

	if err := c.uc.CreateActor(actorDTO, &file); err != nil {
		switch {
		case errors.Is(err, act.ErrInvalidTypeAvatar) || errors.Is(err, act.ErrInvalidResolutionAvatar):
			w.WriteHeader(http.StatusBadRequest)
			render.JSON(w, r, resp.Error(err.Error()))
		default:
			w.WriteHeader(http.StatusInternalServerError)
			render.JSON(w, r, resp.Error(act.ErrInternal.Error()))
		}
		return
	}

	w.WriteHeader(http.StatusCreated)
	render.JSON(w, r, resp.OK())
	return
}

// GetActor - Получение информации об актере
// @Summary Получить актера по FilmId
// @Description Возвращает информацию об актере по его FilmId
// @Tags         actor
// @Param id query string true "FilmId актера"
// @Success 200 {object} response.Response
// @Failure 404 {object} response.Response
// @Failure 500 {object} response.Response
// @Router /actors/{id} [get]
func (c *ActorController) GetActor(w http.ResponseWriter, r *http.Request) {
	actorIdStr := chi.URLParam(r, "actorId")

	actorIdUint64, err := strconv.ParseUint(actorIdStr, 10, 32)
	if err != nil {
		w.WriteHeader(http.StatusBadRequest)
		render.JSON(w, r, resp.Error("invalid actor id"))
		return
	}

	actorId := uint(actorIdUint64)

	actor, err := c.uc.GetActor(actorId)
	if err != nil {
		switch {
		case errors.Is(err, act.ErrActorNotFound):
			w.WriteHeader(http.StatusNotFound)
			render.JSON(w, r, resp.Error(act.ErrActorNotFound.Error()))
		default:
			w.WriteHeader(http.StatusInternalServerError)
			render.JSON(w, r, resp.Error(act.ErrInternal.Error()))
		}
		return
	}

	w.WriteHeader(http.StatusOK)
	render.JSON(w, r, resp.Actors(actor))
	return
}

// GetActors - Получение списка актеров с фильтрацией и пагинацией
// @Summary Получить список актеров с фильтрацией по различным параметрам
// @Description Возвращает список актеров с возможностью фильтрации по имени, дате создания, количеству фильмов, сортировке и пагинации
// @Tags         actor
// @Param name query string false "Имя актера"
// @Param create_at query int false "Год добавления актера"
// @Param min_year query int false "Минимальный год создания актера"
// @Param max_year query int false "Максимальный год создания актера"
// @Param min_movies_count query int false "Минимальное количество фильмов, в которых снялся актер"
// @Param max_movies_count query int false "Максимальное количество фильмов, в которых снялся актер"
// @Param sort_by query string false "Поле для сортировки (например, 'name', 'created_at')"
// @Param order query string false "Порядок сортировки (asc или desc)"
// @Param page query int false "Номер страницы для пагинации"
// @Param page_size query int false "Количество актеров на странице"
// @Success 200 {array} response.Response
// @Failure 400 {object} response.Response "Неверные данные запроса"
// @Failure 500 {object} response.Response "Внутренняя ошибка сервера"
// @Router /actors [get]
func (c *ActorController) GetActors(w http.ResponseWriter, r *http.Request) {
	req := GetActorsFilterRequest{
		Page:     1,
		PageSize: 10,
	}

	if name := r.URL.Query().Get("name"); name != "" {
		req.Name = &name
	}
	if createdAt := r.URL.Query().Get("create_at"); createdAt != "" {
		year, err := strconv.Atoi(createdAt)
		if err != nil {
			w.WriteHeader(http.StatusBadRequest)
			render.JSON(w, r, resp.Error("invalid create_at format"))
			return
		}
		req.CreatedAt = &year
	}
	if minYear := r.URL.Query().Get("min_year"); minYear != "" {
		year, err := strconv.Atoi(minYear)
		if err != nil {
			w.WriteHeader(http.StatusBadRequest)
			render.JSON(w, r, resp.Error("invalid min_year format"))
			return
		}
		req.MinYear = &year
	}
	if maxYear := r.URL.Query().Get("max_year"); maxYear != "" {
		year, err := strconv.Atoi(maxYear)
		if err != nil {
			w.WriteHeader(http.StatusBadRequest)
			render.JSON(w, r, resp.Error("invalid max_year format"))
			return
		}
		req.MaxYear = &year
	}
	if minMoviesCount := r.URL.Query().Get("min_movies_count"); minMoviesCount != "" {
		if count, err := strconv.Atoi(minMoviesCount); err == nil {
			req.MinMoviesCount = &count
		}
	}
	if maxMoviesCount := r.URL.Query().Get("max_movies_count"); maxMoviesCount != "" {
		if count, err := strconv.Atoi(maxMoviesCount); err == nil {
			req.MaxMoviesCount = &count
		}
	}
	if sortBy := r.URL.Query().Get("sort_by"); sortBy != "" {
		req.SortBy = &sortBy
	}
	if order := r.URL.Query().Get("order"); order != "" {
		req.Order = &order
	}
	if page := r.URL.Query().Get("page"); page != "" {
		if pageInt, err := strconv.Atoi(page); err == nil {
			req.Page = pageInt
		}
	}
	if pageSize := r.URL.Query().Get("page_size"); pageSize != "" {
		if pageSizeInt, err := strconv.Atoi(pageSize); err == nil {
			req.PageSize = pageSizeInt
		}
	}

	if err := c.validate.Struct(req); err != nil {
		w.WriteHeader(http.StatusBadRequest)
		render.JSON(w, r, resp.ValidationError(err))
		return
	}

	filter := &act.GetActorsFilter{
		Name:           req.Name,
		CreatedAt:      req.CreatedAt,
		MinYear:        req.MinYear,
		MaxYear:        req.MaxYear,
		MinMoviesCount: req.MinMoviesCount,
		MaxMoviesCount: req.MaxMoviesCount,
		SortBy:         req.SortBy,
		Order:          req.Order,
		Page:           req.Page,
		PageSize:       req.PageSize,
	}

	actors, err := c.uc.GetActors(filter)
	if err != nil {
		switch {
		case errors.Is(err, act.ErrActorNotFound):
			w.WriteHeader(http.StatusNotFound)
			render.JSON(w, r, resp.Error(act.ErrActorNotFound.Error()))
		default:
			w.WriteHeader(http.StatusInternalServerError)
			render.JSON(w, r, resp.Error(act.ErrInternal.Error()))
		}
		return
	}

	w.WriteHeader(http.StatusOK)
	render.JSON(w, r, resp.Actors(actors))
	return
}

// UpdateActor - Обновление информации о актере
// @Summary Обновить информацию об актере
// @Description Обновляет данные актера, включая аватар
// @Tags         actor
// @Accept json
// @Produce      json
// @Param id query string true "FilmId актера"
// @Param        reset_avatar query     bool   false "Reset avatar to default"
// @Param        json         formData  string true  "JSON with login data" example={"login":"new_login"}
// @Param        avatar       formData  file   false "Avatar image file (max 1MB)"
// @Success 200 {object} response.Response
// @Failure 400 {object} response.Response
// @Failure 404 {object} response.Response
// @Failure 413 {object} response.Response
// @Failure 500 {object} response.Response
// @Router /actors/{id} [put]
func (c *ActorController) UpdateActor(w http.ResponseWriter, r *http.Request) {
	log := c.log.With("op", "UpdateActorHandler")

	if err := r.ParseMultipartForm(1 << 20); err != nil {
		if err.Error() == "http: request body too large" {
			log.Error("request body exceeds maximum allowed size")
			w.WriteHeader(http.StatusRequestEntityTooLarge)
			render.JSON(w, r, resp.Error(act.ErrInvalidSizeAvatar.Error()))
			return
		}
		log.Error("failed to parse multipart form", err)
		w.WriteHeader(http.StatusBadRequest)
		render.JSON(w, r, resp.Error("invalid multipart form"))
		return
	}

	var req UpdateActorRequest

	jsonData := r.FormValue("json")
	if err := json.Unmarshal([]byte(jsonData), &req); err != nil {
		log.Error("failed to decode JSON part", err)
		w.WriteHeader(http.StatusBadRequest)
		render.JSON(w, r, resp.Error("invalid JSON part"))
		return
	}

	actorIdStr := chi.URLParam(r, "id")

	actorIdUint64, err := strconv.ParseUint(actorIdStr, 10, 32)
	if err != nil {
		w.WriteHeader(http.StatusBadRequest)
		render.JSON(w, r, resp.Error("invalid actor id"))
		return
	}

	actorId := uint(actorIdUint64)

	req.ResetAvatar, _ = strconv.ParseBool(r.URL.Query().Get("reset_avatar"))

	if err := c.validate.Struct(req); err != nil {
		log.Info("failed to validate request data", err)
		w.WriteHeader(http.StatusBadRequest)
		render.JSON(w, r, resp.ValidationError(err))
		return
	}

	file, _, err := r.FormFile("avatar")
	if errors.Is(err, http.ErrMissingFile) {
		file = nil
	} else if err != nil {
		log.Error("failed to get file from form", err)
		w.WriteHeader(http.StatusBadRequest)
		render.JSON(w, r, resp.Error("failed to get file from form"))
	} else {
		defer func() {
			if file != nil {
				if err := file.Close(); err != nil {
					log.Error("failed to close avatar file", err)
				}
			}
		}()
	}

	actorDTO := &act.ActorDTO{
		ActorId:     actorId,
		Name:        req.Name,
		WikiUrl:     req.WikiUrl,
		ResetAvatar: req.ResetAvatar,
	}

	if err := c.uc.UpdateActor(actorDTO, &file); err != nil {
		log.Error("failed to update actor", err)
		switch {
		case errors.Is(err, act.ErrActorNotFound):
			w.WriteHeader(http.StatusNotFound)
			render.JSON(w, r, resp.Error(err.Error()))
		default:
			w.WriteHeader(http.StatusInternalServerError)
			render.JSON(w, r, resp.Error(act.ErrInternal.Error()))
		}
		return
	}

	w.WriteHeader(http.StatusOK)
	render.JSON(w, r, resp.OK())
	return
}

// DeleteActor - Удаление актера
// @Summary Удалить актера по FilmId
// @Description Удаляет актера по его FilmId
// @Tags         actor
// @Param id query string true "FilmId актера"
// @Success 204 {object} response.Response
// @Failure 404 {object} response.Response
// @Failure 500 {object} response.Response
// @Router /actors/{id} [delete]
func (c *ActorController) DeleteActor(w http.ResponseWriter, r *http.Request) {
	actorIdStr := chi.URLParam(r, "id")

	actorIdUint64, err := strconv.ParseUint(actorIdStr, 10, 32)
	if err != nil {
		w.WriteHeader(http.StatusBadRequest)
		render.JSON(w, r, resp.Error("invalid actor id"))
		return
	}

	actorId := uint(actorIdUint64)

	if err := c.uc.DeleteActor(actorId); err != nil {
		switch {
		case errors.Is(err, act.ErrActorNotFound):
			w.WriteHeader(http.StatusNotFound)
			render.JSON(w, r, resp.Error(act.ErrActorNotFound.Error()))
		default:
			w.WriteHeader(http.StatusInternalServerError)
			render.JSON(w, r, resp.Error(act.ErrInternal.Error()))
		}
		return
	}

	w.WriteHeader(http.StatusNoContent)
	render.JSON(w, r, resp.OK())
	return
}
