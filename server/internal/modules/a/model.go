package a

import "time"

type Actor struct {
	ActorID   uint      `gorm:"primaryKey;column:actor_id"`
	Name      string    `gorm:"size:200;not null;column:name"`
	AvatarURL *string   `gorm:"default:'https://actoravatar.storage-173.s3hoster.by/default/';column:avatar_url"`
	WikiURL   string    `gorm:"default:'';not null;column:wiki_url"`
	CreatedAt time.Time `gorm:"column:create_at"`
}

func ToDTO(actor *Actor) *ActorDTO {
	return &ActorDTO{
		ActorId:   actor.ActorID,
		Name:      actor.Name,
		AvatarUrl: actor.AvatarURL,
		WikiUrl:   actor.WikiURL,
		CreatedAt: actor.CreatedAt,
	}
}

func FromDTO(dto *ActorDTO) *Actor {
	return &Actor{
		ActorID:   dto.ActorId,
		Name:      dto.Name,
		AvatarURL: dto.AvatarUrl,
		WikiURL:   dto.WikiUrl,
		CreatedAt: dto.CreatedAt,
	}
}
