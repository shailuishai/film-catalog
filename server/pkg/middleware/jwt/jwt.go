package jwt

import (
	"context"
	"errors"
	"github.com/go-chi/render"
	"log/slog"
	"net/http"
	"server/pkg/lib/jwt"
	resp "server/pkg/lib/response"
)

func New(log *slog.Logger) func(next http.Handler) http.Handler {
	const op string = "jwt-middleware"
	log = log.With(
		slog.String("op", op),
	)

	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			tokenStr, err := jwt.ExtractJWTFromHeader(r)
			if err != nil {
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
				if errors.Is(err, jwt.ErrNoAccessToken) {
					w.WriteHeader(http.StatusUnauthorized)
					render.JSON(w, r, resp.Error(err.Error()))
				} else {
					w.WriteHeader(http.StatusUnauthorized)
					render.JSON(w, r, resp.Error(err.Error()))
				}
				return
			}

			ctx := context.WithValue(r.Context(), "user_id", claims.Subject)
			next.ServeHTTP(w, r.WithContext(ctx))
		})
	}
}
