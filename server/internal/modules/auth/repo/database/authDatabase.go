package database

import (
	"errors"
	"gorm.io/gorm"
	"log/slog"
	"server/internal/modules/auth"
	"strings"
)

type AuthDatabase struct {
	db  *gorm.DB
	log *slog.Logger
}

func NewAuthDatabase(db *gorm.DB, log *slog.Logger) *AuthDatabase {
	log = log.With("op", "repoLayer")
	return &AuthDatabase{
		db:  db,
		log: log,
	}
}

func (db *AuthDatabase) CreateUser(user *auth.UserAuth) error {
	userModel := ToModel(user)

	if err := db.db.Create(userModel).Error; err != nil {
		db.log.Error(err.Error())
		if strings.Contains(err.Error(), "login") {
			return auth.ErrLoginExists
		} else if strings.Contains(err.Error(), "email") {
			return auth.ErrEmailExists
		}
		return auth.ErrInternal
	}

	return nil
}

func (db *AuthDatabase) GetUserByEmail(email string) (*auth.UserAuth, error) {
	var user User

	if err := db.db.Where("email = ?", email).First(&user).Error; err != nil {
		db.log.Error(err.Error())
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, auth.ErrUserNotFound
		}
		return nil, auth.ErrInternal
	}

	return ToEntity(&user), nil
}

func (db *AuthDatabase) GetUserByLogin(login string) (*auth.UserAuth, error) {
	var user User

	if err := db.db.Where("login = ?", login).First(&user).Error; err != nil {
		db.log.Error(err.Error())
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, auth.ErrUserNotFound
		}
		return nil, auth.ErrInternal
	}

	return ToEntity(&user), nil
}
