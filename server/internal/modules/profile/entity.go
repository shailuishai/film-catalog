package profile

import (
	"mime/multipart"
	"net/http"
)

type UserProfile struct {
	UserId    int64   `json:"user_id"`
	AvatarUrl *string `json:"avatar_url,omitempty"`
}

type Controller interface {
	UpdateUserHandler(w http.ResponseWriter, r *http.Request)
	GetUserHandler(w http.ResponseWriter, r *http.Request)
	DeleteUserHandler(w http.ResponseWriter, r *http.Request)
}

type UseCase interface {
	UpdateUser(avatar *multipart.File, user *UserProfile, resetAvatar bool) error
	GetUser(userId int64) (*UserProfile, error)
	DeleteUser(userId int64) error
}

type Repo interface {
	GetUserById(userId int64) (*UserProfile, error)
	UpdateUser(user *UserProfile) error
	UploadAvatar(avatarSmall []byte, avatarLarge []byte, userId int64) (*string, error)
	DeleteUser(userId int64) error
	DeleteAvatar(userId int64) error
}
