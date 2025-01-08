package cache

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"github.com/go-redis/redis/v8"
	"log/slog"
	"server/internal/init/cache"
	g "server/internal/modules/genre"
	"time"
)

type GenreCache struct {
	log *slog.Logger
	ch  *cache.Cache
}

func NewGenreCache(log *slog.Logger, ch *cache.Cache) *GenreCache {
	return &GenreCache{
		log: log,
		ch:  ch,
	}
}

func (c *GenreCache) SetCacheGenre(key string, value interface{}, ttl time.Duration) error {
	switch v := value.(type) {
	case *g.GenreDTO:
		value = []*g.GenreDTO{v}
	case []*g.GenreDTO:
		value = v
	default:
		return fmt.Errorf("invalid actor type")
	}

	data, err := json.Marshal(value)
	if err != nil {
		return err
	}

	return c.ch.Client.Set(context.Background(), key, data, ttl).Err()
}

func (c *GenreCache) GetCacheGenre(key string) ([]*g.GenreDTO, error) {
	data, err := c.ch.Client.Get(context.Background(), key).Result()
	if errors.Is(err, redis.Nil) {
		return nil, g.ErrMissCache
	} else if err != nil {
		return nil, err
	}

	var genres []*g.GenreDTO
	err = json.Unmarshal([]byte(data), &genres)
	if err != nil {
		return nil, err
	}

	return genres, nil
}

func (c *GenreCache) DeleteCacheGenre(key string) error {
	return c.ch.Client.Del(context.Background(), key).Err()
}
