package controller

import (
	"errors"
	"github.com/go-chi/render"
	"log/slog"
	"net/http"
	"server/internal/modules/auth"
	resp "server/pkg/lib/response"
)

func (c *AuthController) RefreshToken(w http.ResponseWriter, r *http.Request) {
	log := c.log.With(slog.String("op", "RefreshTokenHandler"))

	AccessToken, err := c.uc.RefreshToken(r)
	if err != nil {
		switch {
		case errors.Is(err, auth.ErrNoRefreshToken):
			w.WriteHeader(http.StatusUnauthorized)
			render.JSON(w, r, resp.Error(err.Error()))
		case errors.Is(err, auth.ErrInvalidToken):
			w.WriteHeader(http.StatusUnauthorized)
			render.JSON(w, r, resp.Error(err.Error()))
		case errors.Is(err, auth.ErrExpiredToken):
			w.WriteHeader(http.StatusUnauthorized)
			render.JSON(w, r, resp.Error(err.Error()))
		case errors.Is(err, auth.ErrUserNotFound):
			w.WriteHeader(http.StatusUnauthorized)
			render.JSON(w, r, resp.Error(err.Error()))
		default:
			log.Error(err.Error())
			w.WriteHeader(http.StatusInternalServerError)
			render.JSON(w, r, resp.Error(auth.ErrInternal.Error()))
		}
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	render.JSON(w, r, resp.AccessToken(AccessToken))
}
