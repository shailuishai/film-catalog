package usecase

import (
	"errors"
	"golang.org/x/crypto/bcrypt"
	"log/slog"
	"net/http"
	"server/internal/modules/auth"
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

func (uc *AuthUsecase) SignIn(email string, password string) (string, string, error) {
	if email == "test@example.com" && password == "password" {
		return "access_token_stub", "refresh_token_stub", nil
	}
	return "", "", errors.New("invalid email or password")
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
