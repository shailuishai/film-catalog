package usecase

import (
	"log/slog"
	"server/pkg/lib/jwt"
)

type AuthUsecase struct {
	jwt.JWTService
	log *slog.Logger
}

func NewAuthUsecase(jwtService jwt.JWTService, log *slog.Logger) *AuthUsecase {
	return &AuthUsecase{JWTService: jwtService, log: log}
}
