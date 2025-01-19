package a

import (
	"mime/multipart"
	"net/http"
	"time"
)

type ActorDTO struct {
	ActorId     uint
	Name        string
	AvatarUrl   *string
	WikiUrl     string
	CreatedAt   time.Time
	ResetAvatar bool
}

type GetActorsFilter struct {
	Name           *string
	CreatedAt      *int
	MinYear        *int
	MaxYear        *int
	MinMoviesCount *int
	MaxMoviesCount *int
	SortBy         *string
	Order          *string
	Page           int
	PageSize       int
}

type Controller interface {
	CreateActor(w http.ResponseWriter, r *http.Request)
	GetActor(w http.ResponseWriter, r *http.Request)
	GetActors(w http.ResponseWriter, r *http.Request)
	UpdateActor(w http.ResponseWriter, r *http.Request)
	DeleteActor(w http.ResponseWriter, r *http.Request)
}

type UseCase interface {
	CreateActor(actor *ActorDTO, avatar *multipart.File) error
	GetActor(actorId uint) (*ActorDTO, error)
	GetActors(filter *GetActorsFilter) ([]*ActorDTO, error)
	UpdateActor(actor *ActorDTO, avatar *multipart.File) error
	DeleteActor(actorId uint) error
}

type Repo interface {
	CreateActor(actor *ActorDTO) (uint, error)
	GetActor(actorId uint) (*ActorDTO, error)
	GetActors(filter *GetActorsFilter) ([]*ActorDTO, error)
	UpdateActor(actor *ActorDTO) error
	DeleteActor(actorId uint) error
	UploadAvatar(avatar []byte, name string, actorId uint) (*string, error)
	DeleteAvatar(name string, actorId uint) error
	RenameAvatar(oldName string, actorId uint, newName string) error
	CacheActor(key string, actor interface{}, ttl time.Duration) error
	GetActorFromCache(key string) ([]*ActorDTO, error)
	DeleteActorFromCache(key string) error
}
