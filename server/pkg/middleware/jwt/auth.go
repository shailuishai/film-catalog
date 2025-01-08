package jwt

import (
	"context"
	"errors"
	"github.com/go-chi/render"
	"log/slog"
	"net/http"
	"server/pkg/lib/jwt"
	resp "server/pkg/lib/response"
	"strconv"
)

func NewUserAuth(log *slog.Logger) func(next http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		log = log.With(
			slog.String("op", "middlewareAuth"),
		)

		log.Info("auth middleware enabled")

		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			tokenStr, err := jwt.ExtractJWTFromHeader(r)
			if err != nil {
				log.Info("extraction failed")
				if errors.Is(err, jwt.ErrNoAccessToken) {
					w.WriteHeader(http.StatusUnauthorized)
					render.JSON(w, r, resp.Error(err.Error()))
				} else {
					w.WriteHeader(http.StatusUnauthorized)
					render.JSON(w, r, resp.Error(err.Error()))
				}
				return
			}

			claims, err := jwt.ValidateJWT(tokenStr)
			if err != nil {
				log.Info("validate failed")
				if errors.Is(err, jwt.ErrNoAccessToken) {
					w.WriteHeader(http.StatusUnauthorized)
					render.JSON(w, r, resp.Error(err.Error()))
				} else {
					w.WriteHeader(http.StatusUnauthorized)
					render.JSON(w, r, resp.Error(err.Error()))
				}
				return
			}

			userId, err := strconv.ParseUint(claims.Subject, 10, 32)
			if err != nil {
				log.Error("cant parse userId claims=%s, uint=%d", claims.Subject, userId)
				w.WriteHeader(http.StatusUnauthorized)
				render.JSON(w, r, resp.Error(jwt.ErrInvalidToken.Error()))
				return
			}

			uintUserId := uint(userId)
			ctx := context.WithValue(r.Context(), "userId", uintUserId)
			next.ServeHTTP(w, r.WithContext(ctx))
		})
	}
}

func NewAdminAuth(log *slog.Logger) func(next http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		log = log.With(
			slog.String("op", "middlewareAdminAuth"),
		)

		log.Info("admin auth middleware enabled")

		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			tokenStr, err := jwt.ExtractJWTFromHeader(r)
			if err != nil {
				log.Info("extraction failed")
				if errors.Is(err, jwt.ErrNoAccessToken) {
					w.WriteHeader(http.StatusUnauthorized)
					render.JSON(w, r, resp.Error(err.Error()))
				} else {
					w.WriteHeader(http.StatusUnauthorized)
					render.JSON(w, r, resp.Error(err.Error()))
				}
				return
			}

			claims, err := jwt.ValidateJWT(tokenStr)
			if err != nil {
				log.Info("validate failed")
				if errors.Is(err, jwt.ErrNoAccessToken) {
					w.WriteHeader(http.StatusUnauthorized)
					render.JSON(w, r, resp.Error(err.Error()))
				} else {
					w.WriteHeader(http.StatusUnauthorized)
					render.JSON(w, r, resp.Error(err.Error()))
				}
				return
			}

			// Проверяем, что пользователь является администратором
			if !claims.IsAdmin {
				log.Info("user is not admin")
				w.WriteHeader(http.StatusForbidden)
				render.JSON(w, r, resp.Error("access forbidden"))
				return
			}

			userId, err := strconv.ParseUint(claims.Subject, 10, 32)
			if err != nil {
				log.Error("cant parse userId claims=%s, uint=%d", claims.Subject, userId)
				w.WriteHeader(http.StatusUnauthorized)
				render.JSON(w, r, resp.Error(jwt.ErrInvalidToken.Error()))
				return
			}

			uintUserId := uint(userId)
			ctx := context.WithValue(r.Context(), "userId", uintUserId)
			ctx = context.WithValue(ctx, "isAdmin", true)
			next.ServeHTTP(w, r.WithContext(ctx))
		})
	}
}
