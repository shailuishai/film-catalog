package usecase

import (
	"errors"
	"golang.org/x/crypto/bcrypt"
	"log/slog"
	"net/http"
	"server/internal/modules/auth"
	"server/pkg/lib/jwt"
)

type AuthUsecase struct {
	log *slog.Logger
	rp  auth.Repo
}

func NewAuthUsecase(log *slog.Logger, rp auth.Repo) *AuthUsecase {
	return &AuthUsecase{
		log: log,
		rp:  rp,
	}
}

func (uc *AuthUsecase) SignUp(email string, password string) error {
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		return auth.ErrInternal
	}
	hashPassword := string(hashedPassword)

	user := &auth.UserAuth{
		Email:          email,
		HashedPassword: &hashPassword,
	}

	err = uc.rp.CreateUser(user)
	return err
}

func (uc *AuthUsecase) SignIn(email string, login string, password string) (string, string, error) {
	var user *auth.UserAuth
	if email != "" {
		var err error
		user, err = uc.rp.GetUserByEmail(email)
		if err != nil {
			return "", "", err
		}
	} else if login != "" {
		var err error
		user, err = uc.rp.GetUserByLogin(login)
		if err != nil {
			return "", "", err
		}
	}

	if err := bcrypt.CompareHashAndPassword([]byte(*user.HashedPassword), []byte(password)); err != nil {
		return "", "", auth.ErrUserNotFound
	}

	if !user.VerifiedEmail {
		return "", "", auth.ErrEmailNotConfirmed
	}

	accessToken, err := jwt.GenerateAccessToken(user.UserId)
	if err != nil {
		return "", "", err
	}

	refreshToken, err := jwt.GenerateRefreshToken(user.UserId)
	if err != nil {
		return "", "", err
	}

	return accessToken, refreshToken, nil
}

func (uc *AuthUsecase) GetAuthURL(provider string) (string, error) {
	return "https://authexample.com/" + provider, nil
}

func (uc *AuthUsecase) Callback(provider, state, code string) (bool, string, string, error) {
	if state == "valid_state" && code == "valid_code" {
		return true, "access_token_stub", "refresh_token_stub", nil
	}
	return false, "", "", errors.New("invalid state or code")
}

func (uc *AuthUsecase) RefreshToken(r *http.Request) (string, error) {
	return "new_access_token_stub", nil
}
