package cache

import (
	"context"
	"server/internal/infrastructure/cache"
	u "server/internal/modules/auth"
)

type AuthCache struct {
	ch *cache.Cache
}

func NewAuthCache(ch *cache.Cache) *AuthCache {
	return &AuthCache{
		ch: ch,
	}
}

func (c *AuthCache) SaveStateCode(state string) error {
	if err := c.ch.Db.Set(context.Background(), state, "true", c.ch.StateExpiration).Err(); err != nil {
		return u.ErrInternal
	}
	return nil
}

func (c *AuthCache) VerifyStateCode(state string) (bool, error) {
	state, err := c.ch.Db.Get(context.Background(), state).Result()
	if err != nil {
		return false, u.ErrInvalidState
	}

	if state == "true" {
		if err := c.ch.Db.Del(context.Background(), state).Err(); err != nil {
			return false, u.ErrInternal
		}
		return true, nil
	}

	return false, nil
}
