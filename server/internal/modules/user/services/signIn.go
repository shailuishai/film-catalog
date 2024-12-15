package services

import (
	"golang.org/x/crypto/bcrypt"
	u "server/internal/modules/user"
)

func (uuc *UserUseCase) SignIn(email string, password string) (string, string, error) {

	user, err := uuc.repo.GetUserByEmail(email)
	if err != nil {
		return "", "", err
	}

	if err = bcrypt.CompareHashAndPassword([]byte(*user.HashedPassword), []byte(password)); err != nil {
		return "", "", u.ErrUserNotFound
	}

	if !user.VerifiedEmail {
		return "", "", u.ErrEmailNotConfirmed
	}

	accessToken, err := uuc.jwt.GenerateAccessToken(user.UserId, user.IsAdmin)
	if err != nil {
		return "", "", err
	}

	refreshToken, err := uuc.jwt.GenerateRefreshToken(user.UserId)
	if err != nil {
		return "", "", err
	}

	return accessToken, refreshToken, nil
}
