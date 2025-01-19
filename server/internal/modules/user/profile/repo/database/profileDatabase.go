package database

import (
	"errors"
	"gorm.io/gorm"
	"log/slog"
	u "server/internal/modules/user"
	"server/internal/modules/user/profile"
)

type ProfileFDatabase struct {
	db  *gorm.DB
	log *slog.Logger
}

func NewProfileDatabase(db *gorm.DB, log *slog.Logger) *ProfileFDatabase {
	return &ProfileFDatabase{
		db:  db,
		log: log,
	}
}

func (db *ProfileFDatabase) GetUserById(userId uint) (*profile.UserProfile, error) {
	var user u.User

	if err := db.db.First(&user, userId).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, u.ErrUserNotFound
		}
		return nil, err
	}

	return u.ToProfileUser(&user), nil
}

func (db *ProfileFDatabase) UpdateUser(user *profile.UserProfile) error {
	var nowUser u.User

	// Получаем текущего пользователя из базы данных
	if err := db.db.First(&nowUser, user.UserId).Error; err != nil {
		return err
	}

	// Обновляем только те поля, которые были переданы в запросе
	if user.Login != nil {
		nowUser.Login = *user.Login
	}
	if user.AvatarUrl != nil {
		nowUser.AvatarURL = *user.AvatarUrl
	}

	// Сохраняем обновленного пользователя
	if err := db.db.Save(&nowUser).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return u.ErrUserNotFound
		}
		return err
	}

	return nil
}

func (db *ProfileFDatabase) DeleteUser(userId uint) error {
	var user u.User

	if err := db.db.First(&user, userId).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return u.ErrUserNotFound
		}
		return err
	}

	if err := db.db.Delete(&user).Error; err != nil {
		return err
	}

	return nil
}
