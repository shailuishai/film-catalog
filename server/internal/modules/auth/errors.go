package auth

import "errors"

var (
	ErrInternal            = errors.New("internal server error")
	ErrInvalidState        = errors.New("invalid state")
	ErrNoAccessToken       = errors.New("no access token")
	ErrNoRefreshToken      = errors.New("no refresh token")
	ErrExpiredToken        = errors.New("token expired")
	ErrInvalidToken        = errors.New("invalid token")
	ErrUnsupportedProvider = errors.New("unsupported provider")
	ErrEmailExists         = errors.New("user with this email already exists")
	ErrLoginExists         = errors.New("user with this login already exists")
	ErrUserNotFound        = errors.New("user not found")
	ErrEmailNotConfirmed   = errors.New("email not confirmed")
)
