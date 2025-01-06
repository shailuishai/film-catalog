package database

import (
	"errors"
	"gorm.io/gorm"
	"log/slog"
	act "server/internal/modules/actor"
)

type ActorDatabase struct {
	db  *gorm.DB
	log *slog.Logger
}

func NewActorDatabase(db *gorm.DB, log *slog.Logger) *ActorDatabase {
	return &ActorDatabase{
		db:  db,
		log: log,
	}
}

func (db *ActorDatabase) CreateActor(actorDTO *act.ActorDTO) (uint, error) {
	actorModel := act.FromDTO(actorDTO)
	if err := db.db.Create(actorModel).Error; err != nil {
		return 0, act.ErrInternal
	}
	return actorModel.ActorID, nil
}

func (db *ActorDatabase) GetActor(actorId uint) (*act.ActorDTO, error) {
	var actorModel act.Actor
	if err := db.db.First(&actorModel, actorId).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, act.ErrActorNotFound
		}
		return nil, act.ErrInternal
	}
	return act.ToDTO(&actorModel), nil
}

func (db *ActorDatabase) GetActors(filters *act.GetActorsFilter) ([]*act.ActorDTO, error) {
	query := db.db.Table("actors").
		Select("actors.*, COUNT(film_actor.film_id) as movies_count").
		Joins("LEFT JOIN film_actor ON actors.actor_id = film_actor.actor_id").
		Group("actors.actor_id")

	if filters.Name != nil {
		query = query.Where("LOWER(actors.name) LIKE LOWER(?)", "%"+*filters.Name+"%")
	}
	if filters.CreatedAt != nil {
		query = query.Where("EXTRACT(YEAR FROM actors.create_at) = ?", filters.CreatedAt)
	}
	if filters.MinYear != nil {
		query = query.Where("EXTRACT(YEAR FROM actors.create_at) >= ?", *filters.MinYear)
	}
	if filters.MaxYear != nil {
		query = query.Where("EXTRACT(YEAR FROM actors.create_at) <= ?", *filters.MaxYear)
	}
	if filters.MinMoviesCount != nil {
		query = query.Having("COUNT(film_actor.film_id) >= ?", *filters.MinMoviesCount)
	}
	if filters.MaxMoviesCount != nil {
		query = query.Having("COUNT(film_actor.film_id) <= ?", *filters.MaxMoviesCount)
	}
	if filters.SortBy != nil {
		order := "asc"
		if filters.Order != nil && *filters.Order == "desc" {
			order = "desc"
		}
		switch *filters.SortBy {
		case "name", "create_at", "movies_count":
			query = query.Order(*filters.SortBy + " " + order)
		default:
			query = query.Order("actors.actor_id " + order)
		}
	}

	offset := (filters.Page - 1) * filters.PageSize
	query = query.Offset(offset).Limit(filters.PageSize)

	var actors []*act.Actor
	if err := query.Find(&actors).Error; err != nil {
		return nil, err
	}
	if len(actors) == 0 {
		return nil, act.ErrActorNotFound
	}

	var DtoActors []*act.ActorDTO
	for _, actor := range actors {
		DtoActors = append(DtoActors, act.ToDTO(actor))
	}

	return DtoActors, nil
}

func (db *ActorDatabase) UpdateActor(actorDTO *act.ActorDTO) error {
	actorModel := act.FromDTO(actorDTO)
	if err := db.db.Model(&act.Actor{}).Where("actor_id = ?", actorDTO.ActorId).Updates(actorModel).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return act.ErrActorNotFound
		}
		return act.ErrInternal
	}
	return nil
}

func (db *ActorDatabase) DeleteActor(actorId uint) error {
	if err := db.db.Delete(&act.Actor{}, actorId).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return act.ErrActorNotFound
		}
		return act.ErrInternal
	}
	return nil
}
