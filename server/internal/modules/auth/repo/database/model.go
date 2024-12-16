package database

import (
	"server/internal/modules/auth"
)

type User struct {
	UserId         uint    `gorm:"primaryKey;column:user_id"`
	HashedPassword *string `gorm:"size:255;column:hashed_password"`
	IsAdmin        bool    `gorm:"default:false;column:is_admin"`
	Login          string  `gorm:"unique;size:100;not null;column:login"`
	Email          string  `gorm:"unique;size:100;not null;column:email"`
	VerifiedEmail  bool    `gorm:"default:false;column:verified_email"`
	AvatarURL      string  `gorm:"default:'https://useravatar.database-173.s3hoster.by/default/';column:avatar_url"`
}

func ToEntity(user *User) *auth.UserAuth {
	return &auth.UserAuth{
		UserId:         user.UserId,
		HashedPassword: user.HashedPassword,
		Login:          user.Login,
		Email:          user.Email,
		IsAdmin:        user.IsAdmin,
		VerifiedEmail:  user.VerifiedEmail,
	}
}

func ToModel(user *auth.UserAuth) *User {
	return &User{
		UserId:         user.UserId,
		HashedPassword: user.HashedPassword,
		IsAdmin:        user.IsAdmin,
		Email:          user.Email,
		Login:          user.Login,
		VerifiedEmail:  user.VerifiedEmail,
	}
}
