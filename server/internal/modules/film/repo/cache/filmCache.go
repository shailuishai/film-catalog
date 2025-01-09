package cache

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"github.com/go-redis/redis/v8"
	"server/internal/init/cache"
	f "server/internal/modules/film"
	"time"
)

type FilmCache struct {
	ch *cache.Cache
}

func NewFilmCache(ch *cache.Cache) *FilmCache {
	return &FilmCache{
		ch: ch,
	}
}

func (c *FilmCache) SetFilmsToCache(key string, films interface{}, ttl time.Duration) error {
	switch v := films.(type) {
	case *f.FilmDTO:
		films = []*f.FilmDTO{v}
	case []*f.FilmDTO:
		films = v
	default:
		return fmt.Errorf("invalid film type")
	}

	data, err := json.Marshal(films)
	if err != nil {
		return err
	}

	return c.ch.Client.Set(context.Background(), key, data, ttl).Err()
}

func (c *FilmCache) GetFilmsFromCache(key string) ([]*f.FilmDTO, error) {
	data, err := c.ch.Client.Get(context.Background(), key).Result()
	if errors.Is(err, redis.Nil) {
		return nil, f.ErrFilmCacheMiss
	} else if err != nil {
		return nil, err
	}

	var result []*f.FilmDTO
	err = json.Unmarshal([]byte(data), &result)
	if err != nil {
		return nil, err
	}

	return result, nil
}

func (c *FilmCache) DeleteFilmFromCache(key string) error {
	return c.ch.Client.Del(context.Background(), key).Err()
}
