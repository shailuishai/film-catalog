package usecase

import (
	"crypto/sha256"
	"encoding/hex"
	"errors"
	"fmt"
	"log/slog"
	"mime/multipart"
	act "server/internal/modules/a"
	avatarManager "server/pkg/lib/avatarMenager"
	"strconv"
	"strings"
	"time"
)

type ActorUseCase struct {
	log *slog.Logger
	rp  act.Repo
}

func NewActorUseCase(log *slog.Logger, rp act.Repo) *ActorUseCase {
	return &ActorUseCase{
		log: log,
		rp:  rp,
	}
}

func (uc *ActorUseCase) CreateActor(actor *act.ActorDTO, avatar *multipart.File) error {
	log := uc.log.With("op", "usecase create actor")

	if *avatar != nil {
		_, avatar512x512, err := avatarManager.ParsingAvatarImage(avatar)
		if err != nil {
			log.Error("failed to parse avatar image", err)
			switch {
			case errors.Is(err, avatarManager.ErrInvalidTypeAvatar):
				return act.ErrInvalidTypeAvatar
			case errors.Is(err, avatarManager.ErrInvalidResolutionAvatar):
				return act.ErrInvalidResolutionAvatar
			default:
				return act.ErrInternal
			}
		}

		actorId, err := uc.rp.CreateActor(actor)
		if err != nil {
			return err
		}

		avatarUrl, err := uc.rp.UploadAvatar(avatar512x512, actor.Name, actorId)
		if err != nil {
			return act.ErrInternal
		}

		log.Info(*avatarUrl)
		actor.ActorId = actorId
		actor.AvatarUrl = avatarUrl

		if err := uc.rp.UpdateActor(actor); err != nil {
			return err
		}

		return nil
	} else {
		log.Info("file nil", "file", avatar)

		if _, err := uc.rp.CreateActor(actor); err != nil {
			return err
		}

		return nil
	}
}

func (uc *ActorUseCase) GetActor(actorId uint) (*act.ActorDTO, error) {
	cacheKey := "actor_" + strconv.Itoa(int(actorId))
	actorFromCache, err := uc.rp.GetActorFromCache(cacheKey)
	if err == nil && actorFromCache != nil {
		return actorFromCache[0], nil
	}

	actorFromDB, err := uc.rp.GetActor(actorId)
	if err != nil {
		return nil, err
	}

	_ = uc.rp.CacheActor(cacheKey, actorFromDB, time.Hour)

	return actorFromDB, nil
}

func (uc *ActorUseCase) GetActors(filter *act.GetActorsFilter) ([]*act.ActorDTO, error) {
	cacheKey := generateCacheKey(filter)
	actorFromCache, err := uc.rp.GetActorFromCache(cacheKey)
	if err == nil && actorFromCache != nil {
		return actorFromCache, nil
	}

	actorsFromDb, err := uc.rp.GetActors(filter)
	if err != nil {
		return nil, err
	}
	_ = uc.rp.CacheActor(cacheKey, actorsFromDb, time.Minute*15)

	return actorsFromDb, nil
}

func generateCacheKey(filter *act.GetActorsFilter) string {
	var keyParts []string

	if filter.Name != nil {
		keyParts = append(keyParts, fmt.Sprintf("name=%s", *filter.Name))
	}
	if filter.CreatedAt != nil {
		keyParts = append(keyParts, fmt.Sprintf("created_at=%d", *filter.CreatedAt))
	}
	if filter.MinYear != nil {
		keyParts = append(keyParts, fmt.Sprintf("min_year=%d", *filter.MinYear))
	}
	if filter.MaxYear != nil {
		keyParts = append(keyParts, fmt.Sprintf("max_year=%d", *filter.MaxYear))
	}
	if filter.MinMoviesCount != nil {
		keyParts = append(keyParts, fmt.Sprintf("min_movies_count=%d", *filter.MinMoviesCount))
	}
	if filter.MaxMoviesCount != nil {
		keyParts = append(keyParts, fmt.Sprintf("max_movies_count=%d", *filter.MaxMoviesCount))
	}
	if filter.SortBy != nil {
		keyParts = append(keyParts, fmt.Sprintf("sort_by=%s", *filter.SortBy))
	}
	if filter.Order != nil {
		keyParts = append(keyParts, fmt.Sprintf("order=%s", *filter.Order))
	}
	keyParts = append(keyParts, fmt.Sprintf("page=%d", filter.Page))
	keyParts = append(keyParts, fmt.Sprintf("page_size=%d", filter.PageSize))

	keyString := strings.Join(keyParts, "&")

	hash := sha256.New()
	hash.Write([]byte(keyString))
	hashedKey := hash.Sum(nil)

	return hex.EncodeToString(hashedKey)
}

func (uc *ActorUseCase) UpdateActor(actor *act.ActorDTO, avatar *multipart.File) error {
	log := uc.log.With("op", "usecase update actor")

	existingActor, err := uc.rp.GetActor(actor.ActorId)
	if err != nil {
		return err
	}

	if actor.ResetAvatar {
		defaultAvatar := "https://actoravatar.storage-173.s3hoster.by/default"
		if err := uc.rp.DeleteAvatar(existingActor.Name, actor.ActorId); err != nil {
			log.Error("failed to delete avatar", err)
			return err
		}
		actor.AvatarUrl = &defaultAvatar
	}

	if *avatar != nil {
		_, avatar512x512, err := avatarManager.ParsingAvatarImage(avatar)
		if err != nil {
			log.Error("failed to parse avatar image", err)
			switch {
			case errors.Is(err, avatarManager.ErrInvalidTypeAvatar):
				return act.ErrInvalidTypeAvatar
			case errors.Is(err, avatarManager.ErrInvalidResolutionAvatar):
				return act.ErrInvalidResolutionAvatar
			default:
				return act.ErrInternal
			}
		}

		if actor.Name == "" {
			actor.Name = existingActor.Name
		}

		avatarUrl, err := uc.rp.UploadAvatar(avatar512x512, actor.Name, actor.ActorId)
		if err != nil {
			return err
		}

		actor.AvatarUrl = avatarUrl
	} else if *avatar == nil && existingActor.Name != actor.Name && !actor.ResetAvatar {
		if err := uc.rp.RenameAvatar(existingActor.Name, actor.ActorId, actor.Name); err != nil {
			return err
		}
	}

	err = uc.rp.UpdateActor(actor)
	if err != nil {
		return err
	}

	cacheKey := "actor_" + strconv.Itoa(int(actor.ActorId))
	_ = uc.rp.DeleteActorFromCache(cacheKey)

	return nil
}

func (uc *ActorUseCase) DeleteActor(actorId uint) error {
	actor, err := uc.rp.GetActor(actorId)
	if err != nil {
		return err
	}

	if actor.AvatarUrl != nil && *actor.AvatarUrl != "" {
		err := uc.rp.DeleteAvatar(*actor.AvatarUrl, actorId)
		if err != nil {
			return err
		}
	}

	err = uc.rp.DeleteActor(actorId)
	if err != nil {
		return err
	}

	cacheKey := "actor_" + strconv.Itoa(int(actorId))
	_ = uc.rp.DeleteActorFromCache(cacheKey)

	return nil
}

func (uc *ActorUseCase) DeleteActors(ids []uint) error {
	for _, id := range ids {
		if err := uc.rp.DeleteActor(id); err != nil {
			return err
		}

		cacheKey := "actor_" + strconv.Itoa(int(id))
		_ = uc.rp.DeleteActorFromCache(cacheKey)
	}
	return nil
}
