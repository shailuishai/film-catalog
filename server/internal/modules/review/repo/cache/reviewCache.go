package cache

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"github.com/go-redis/redis/v8"
	"log/slog"
	"server/internal/init/cache"
	r "server/internal/modules/review"
	"time"
)

type ReviewCache struct {
	log *slog.Logger
	ch  *cache.Cache
}

func NewReviewCache(log *slog.Logger, ch *cache.Cache) *ReviewCache {
	return &ReviewCache{
		log: log,
		ch:  ch,
	}
}

func (c *ReviewCache) SetCache(key string, value interface{}, ttl time.Duration) error {
	var data []byte
	var err error

	switch v := value.(type) {
	case *r.ReviewDTO:
		data, err = json.Marshal([]*r.ReviewDTO{v})
	case []*r.ReviewDTO:
		data, err = json.Marshal(v)
	default:
		return fmt.Errorf("invalid type for caching")
	}

	if err != nil {
		return err
	}

	return c.ch.Client.Set(context.Background(), key, data, ttl).Err()
}

func (c *ReviewCache) GetCache(key string) ([]*r.ReviewDTO, error) {
	data, err := c.ch.Client.Get(context.Background(), key).Result()
	if errors.Is(err, redis.Nil) {
		return nil, r.ErrMissCache
	} else if err != nil {
		return nil, err
	}

	var reviews []*r.ReviewDTO
	if err := json.Unmarshal([]byte(data), &reviews); err != nil {
		return nil, err
	}

	return reviews, nil
}

func (c *ReviewCache) DeleteCache(key string) error {
	return c.ch.Client.Del(context.Background(), key).Err()
}
