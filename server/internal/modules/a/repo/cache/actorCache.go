package cache

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"github.com/go-redis/redis/v8"
	"server/internal/init/cache"
	act "server/internal/modules/a"
	"time"
)

type ActorCahce struct {
	ch *cache.Cache
}

func NewActorCahce(ch *cache.Cache) *ActorCahce {
	return &ActorCahce{
		ch: ch,
	}
}

func (c *ActorCahce) CacheActor(key string, actors interface{}, ttl time.Duration) error {
	switch v := actors.(type) {
	case *act.ActorDTO:
		actors = []*act.ActorDTO{v}
	case []*act.ActorDTO:
		actors = v
	default:
		return fmt.Errorf("invalid actor type")
	}

	data, err := json.Marshal(actors)
	if err != nil {
		return err
	}

	return c.ch.Client.Set(context.Background(), key, data, ttl).Err()
}

func (c *ActorCahce) GetActorFromCache(key string) ([]*act.ActorDTO, error) {
	data, err := c.ch.Client.Get(context.Background(), key).Result()
	if errors.Is(err, redis.Nil) {
		return nil, act.ErrMissCache
	} else if err != nil {
		return nil, err
	}

	var result []*act.ActorDTO
	err = json.Unmarshal([]byte(data), &result)
	if err != nil {
		return nil, err
	}

	return result, nil
}

func (c *ActorCahce) DeleteActorFromCache(key string) error {
	return c.ch.Client.Del(context.Background(), key).Err()
}

func (c *ActorCahce) ClearAllActorsFromCache() error {
	var keys []string
	var cursor uint64
	var err error

	for {
		keys, cursor, err = c.ch.Client.Scan(context.Background(), cursor, "actors:*", 100).Result()
		if err != nil {
			return err
		}

		if len(keys) > 0 {
			err = c.ch.Client.Del(context.Background(), keys...).Err()
			if err != nil {
				return err
			}
		}

		if cursor == 0 {
			break
		}
	}

	return nil
}
