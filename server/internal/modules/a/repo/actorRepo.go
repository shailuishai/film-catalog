package repo

import (
	"server/internal/modules/a"
	"time"
)

type ActorDb interface {
	CreateActor(actor *a.ActorDTO) (uint, error)
	GetActor(actorId uint) (*a.ActorDTO, error)
	GetActors(filter *a.GetActorsFilter) ([]*a.ActorDTO, error)
	UpdateActor(actor *a.ActorDTO) error
	DeleteActor(actorId uint) error
}

type ActorS3 interface {
	UploadAvatar(avatar []byte, name string, actorId uint) (*string, error)
	DeleteAvatar(name string, actorId uint) error
	RenameAvatar(oldName string, actorId uint, newName string) error
}

type ActorCache interface {
	CacheActor(key string, actor interface{}, ttl time.Duration) error
	GetActorFromCache(key string) ([]*a.ActorDTO, error)
	DeleteActorFromCache(key string) error
}

type Repo struct {
	db ActorDb
	s3 ActorS3
	ch ActorCache
}

func NewActorRepo(db ActorDb, s3 ActorS3, ch ActorCache) *Repo {
	return &Repo{
		db: db,
		s3: s3,
		ch: ch,
	}
}

func (r *Repo) CreateActor(actor *a.ActorDTO) (uint, error) {
	return r.db.CreateActor(actor)
}

func (r *Repo) GetActor(actorId uint) (*a.ActorDTO, error) {
	return r.db.GetActor(actorId)
}

func (r *Repo) GetActors(filter *a.GetActorsFilter) ([]*a.ActorDTO, error) {
	return r.db.GetActors(filter)
}

func (r *Repo) UpdateActor(actor *a.ActorDTO) error {
	return r.db.UpdateActor(actor)
}

func (r *Repo) DeleteActor(actorId uint) error {
	return r.db.DeleteActor(actorId)
}

func (r *Repo) UploadAvatar(avatar []byte, name string, actorId uint) (*string, error) {
	return r.s3.UploadAvatar(avatar, name, actorId)
}

func (r *Repo) DeleteAvatar(name string, actorId uint) error {
	return r.s3.DeleteAvatar(name, actorId)
}

func (r *Repo) CacheActor(key string, actor interface{}, ttl time.Duration) error {
	return r.ch.CacheActor(key, actor, ttl)
}

func (r *Repo) GetActorFromCache(key string) ([]*a.ActorDTO, error) {
	return r.ch.GetActorFromCache(key)
}

func (r *Repo) DeleteActorFromCache(key string) error {
	return r.ch.DeleteActorFromCache(key)
}

func (r *Repo) RenameAvatar(oldName string, actorId uint, newName string) error {
	return r.s3.RenameAvatar(oldName, actorId, newName)
}
