package database

import (
	"errors"
	"gorm.io/gorm"
	"log/slog"
	"server/internal/modules/auth"
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
		if !errors.Is(err, gorm.ErrDuplicatedKey) {
			return auth.ErrEmailExists
		}
		return auth.ErrInternal
	}

	return nil
}

func (db *AuthDatabase) GetUserByEmail(email string) (*auth.UserAuth, error) {
	var user User

	if err := db.db.Where("email = ?", email).First(&user).Error; err != nil {
		return nil, err
	}

	return ToEntity(&user), nil
}
