package controller

import (
	"encoding/json"
	"errors"
	"github.com/go-chi/chi/v5"
	"github.com/go-chi/render"
	"github.com/go-playground/validator/v10"
	"log/slog"
	"net/http"
	u "server/internal/modules/user"
	"server/internal/modules/user/profile"
	"server/pkg/lib"
	resp "server/pkg/lib/response"
	"strconv"
	"time"
)

type ProfileController struct {
	log      *slog.Logger
	uc       profile.UseCase
	validate *validator.Validate
}

func NewProfileController(log *slog.Logger, uc profile.UseCase) *ProfileController {
	validate := validator.New()
	return &ProfileController{
		log:      log,
		uc:       uc,
		validate: validate,
	}
}

// UpdateUser
// @Summary      Update user profile
// @Description  Updates the user profile information, including login and avatar.
// @Description  The request accepts a JSON part with the login data, an optional avatar file, and a query parameter `reset_avatar`.
// @Tags         profile
// @Accept       multipart/form-data
// @Produce      json
// @Param        reset_avatar query     bool   false "Reset avatar to default"
// @Param        json         formData  string true  "JSON with login data" example={"login":"new_login"}
// @Param        avatar       formData  file   false "Avatar image file (max 1MB)"
// @Success      200          {object} response.Response  "Profile updated successfully"
// @Failure      400          {object} response.Response  "Invalid request data"
// @Failure      401          {object} response.Response  "Unauthorized"
// @Failure      404          {object} response.Response  "User not found"
// @Failure      413          {object} response.Response  "File size exceeds 1MB limit"
// @Failure      500          {object} response.Response  "Internal server error"
// @Router       /profile [put]
// @Security     ApiKeyAuth
func (c *ProfileController) UpdateUser(w http.ResponseWriter, r *http.Request) {
	log := c.log.With("op", "UpdateUserHandler")

	userId, ok := r.Context().Value("userId").(uint)
	if !ok {
		log.Error("can't get userId from context")
		w.WriteHeader(http.StatusUnauthorized)
		render.JSON(w, r, resp.Error("unauthorized"))
		return
	}

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

	var req UpdateUserRequest

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

	resetAvatar := r.URL.Query().Get("reset_avatar") == "true"
	user := &profile.UserProfile{
		UserId:      userId,
		Login:       req.Login,
		ResetAvatar: resetAvatar,
	}

	file, _, err := r.FormFile("avatar")
	if errors.Is(err, http.ErrMissingFile) {
		file = nil
	} else if err != nil {
		log.Error("failed to retrieve avatar file", err)
		w.WriteHeader(http.StatusBadRequest)
		render.JSON(w, r, resp.Error(u.ErrInvalidAvatarFile.Error()))
		return
	} else {
		defer func() {
			if file != nil {
				if err := file.Close(); err != nil {
					log.Error("failed to close avatar file", err)
				}
			}
		}()
	}

	if err := c.uc.UpdateUser(user, &file); err != nil {
		log.Error(err.Error())
		switch {
		case errors.Is(err, u.ErrUserNotFound):
			w.WriteHeader(http.StatusNotFound)
			render.JSON(w, r, resp.Error(err.Error()))
		case errors.Is(err, u.ErrUserAuthWithOauth2):
			w.WriteHeader(http.StatusUnauthorized)
			render.JSON(w, r, resp.Error(u.ErrUserAuthWithOauth2.Error()))
		case errors.Is(err, u.ErrInvalidResolutionAvatar) || errors.Is(err, u.ErrInvalidTypeAvatar):
			w.WriteHeader(http.StatusBadRequest)
			render.JSON(w, r, resp.Error(err.Error()))
		default:
			w.WriteHeader(http.StatusInternalServerError)
			render.JSON(w, r, resp.Error(u.ErrInternal.Error()))
		}
		return
	}

	w.WriteHeader(http.StatusOK)
	render.JSON(w, r, resp.OK())
}

// GetUser
// @Summary      Get user profile
// @Description  Retrieves the user profile information.
// @Tags         profile
// @Produce      json
// @Success      200  {object} response.Response  "User profile retrieved successfully"
// @Failure      401  {object} response.Response  "Unauthorized"
// @Failure      404  {object} response.Response  "User not found"
// @Failure      500  {object} response.Response  "Internal server error"
// @Router       /profile [get]
// @Security     ApiKeyAuth
func (c *ProfileController) GetUser(w http.ResponseWriter, r *http.Request) {
	log := c.log.With("op", "GetUserHandler")

	userId, ok := r.Context().Value("userId").(uint)
	if !ok {
		log.Error("can't get userId from context")
		w.WriteHeader(http.StatusUnauthorized)
		render.JSON(w, r, resp.Error("unauthorized"))
		return
	}

	user, err := c.uc.GetUser(userId)
	if err != nil {
		log.Error(err.Error())
		switch {
		case errors.Is(err, u.ErrUserNotFound):
			w.WriteHeader(http.StatusNotFound)
			render.JSON(w, r, resp.Error(u.ErrUserNotFound.Error()))
		default:
			w.WriteHeader(http.StatusInternalServerError)
			render.JSON(w, r, resp.Error(u.ErrInternal.Error()))
		}
		return
	}

	w.WriteHeader(http.StatusOK)
	render.JSON(w, r, resp.UserProfile(user))
}

// DeleteUser
// @Summary      Delete user profile
// @Description  Deletes the user profile and all associated data.
// @Tags         profile
// @Produce      json
// @Success      200  {object} response.Response  "User profile deleted successfully"
// @Failure      401  {object} response.Response  "Unauthorized"
// @Failure      500  {object} response.Response  "Internal server error"
// @Router       /profile [delete]
// @Security     ApiKeyAuth
func (c *ProfileController) DeleteUser(w http.ResponseWriter, r *http.Request) {
	log := c.log.With("op", "DeleteUserHandler")

	userId, ok := r.Context().Value("userId").(uint)
	if !ok {
		log.Error("can't get userId from context")
		w.WriteHeader(http.StatusUnauthorized)
		render.JSON(w, r, resp.Error("unauthorized"))
		return
	}

	if err := c.uc.DeleteUser(userId); err != nil {
		log.Error(err.Error())
		switch {
		case errors.Is(err, u.ErrInternal):
			w.WriteHeader(http.StatusInternalServerError)
			render.JSON(w, r, u.ErrInternal.Error())
		default:
			w.WriteHeader(http.StatusInternalServerError)
			render.JSON(w, r, resp.Error(u.ErrInternal.Error()))
		}
		return
	}

	_, err := r.Cookie("refresh_token")
	if err != nil {
		w.WriteHeader(http.StatusOK)
		render.JSON(w, r, resp.OK())
		return
	}

	http.SetCookie(w, &http.Cookie{
		Name:     "refresh_token",
		Value:    "",
		Expires:  time.Now().Add(-time.Hour),
		HttpOnly: true,
		Path:     "/",
		SameSite: http.SameSiteNoneMode,
	})

	w.WriteHeader(http.StatusNoContent)
	render.JSON(w, r, resp.OK())
	return
}

// AdminGetAllUsers - Получение всех пользователей для администратора
// @Summary Получить всех пользователей для администратора
// @Description Возвращает список всех пользователей с возможностью пагинации
// @Tags admin
// @Param page query int false "Номер страницы"
// @Param page_size query int false "Размер страницы"
// @Success 200 {array} response.Response
// @Failure 500 {object} response.Response
// @Router /admin/users [get]
// @Security ApiKeyAuth
func (c *ProfileController) AdminGetAllUsers(w http.ResponseWriter, r *http.Request) {
	log := c.log.With("op", "AdminGetAllUsers")

	page, err := strconv.Atoi(r.URL.Query().Get("page"))
	if err != nil || page < 1 {
		page = 1
	}

	pageSize, err := strconv.Atoi(r.URL.Query().Get("page_size"))
	if err != nil || pageSize < 1 || pageSize > 100 {
		pageSize = 10
	}

	users, err := c.uc.AdminGetAllUsers(page, pageSize)
	if err != nil {
		log.Error("failed to get all users", err)
		w.WriteHeader(http.StatusInternalServerError)
		render.JSON(w, r, resp.Error(u.ErrInternal.Error()))
		return
	}

	w.WriteHeader(http.StatusOK)
	render.JSON(w, r, resp.Users(users))
}

// AdminDeleteUser - Удаление пользователя администратором
// @Summary Удалить пользователя по FilmId
// @Description Удаляет пользователя по его FilmId
// @Tags admin
// @Param id path string true "FilmId пользователя"
// @Success 204 {object} response.Response
// @Failure 404 {object} response.Response
// @Failure 500 {object} response.Response
// @Router /admin/users/{id} [delete]
// @Security ApiKeyAuth
func (c *ProfileController) AdminDeleteUser(w http.ResponseWriter, r *http.Request) {
	log := c.log.With("op", "AdminDeleteUser")

	userIdStr := chi.URLParam(r, "id")
	userId, err := strconv.ParseUint(userIdStr, 10, 32)
	if err != nil {
		w.WriteHeader(http.StatusBadRequest)
		render.JSON(w, r, resp.Error("invalid user id"))
		return
	}

	if err := c.uc.AdminDeleteUser(uint(userId)); err != nil {
		log.Error("failed to delete user", err)
		switch {
		case errors.Is(err, u.ErrUserNotFound):
			w.WriteHeader(http.StatusNotFound)
			render.JSON(w, r, resp.Error(u.ErrUserNotFound.Error()))
		default:
			w.WriteHeader(http.StatusInternalServerError)
			render.JSON(w, r, resp.Error(u.ErrInternal.Error()))
		}
		return
	}

	w.WriteHeader(http.StatusNoContent)
	render.JSON(w, r, resp.OK())
}

// AdminMultiDeleteUsers - Удаление нескольких пользователей администратором
// @Summary Удалить несколько пользователей
// @Description Удаляет несколько пользователей по их FilmId
// @Tags admin
// @Param ids query []uint true "Список FilmId пользователей"
// @Success 204 {object} response.Response
// @Failure 400 {object} response.Response
// @Failure 500 {object} response.Response
// @Router /admin/users [delete]
// @Security ApiKeyAuth
func (c *ProfileController) AdminMultiDeleteUsers(w http.ResponseWriter, r *http.Request) {
	log := c.log.With("op", "AdminMultiDeleteUsers")

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

	if err := c.uc.AdminMultiDeleteUsers(idsSlice); err != nil {
		log.Error("failed to delete multiple users", err)
		w.WriteHeader(http.StatusInternalServerError)
		render.JSON(w, r, resp.Error(u.ErrInternal.Error()))
		return
	}

	w.WriteHeader(http.StatusNoContent)
	render.JSON(w, r, resp.OK())
}
