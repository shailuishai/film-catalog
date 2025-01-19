package a

import "errors"

var (
	ErrInternal                = errors.New("internal server error")
	ErrActorNotFound           = errors.New("actor not found")
	ErrMissCache               = errors.New("miss cache error")
	ErrInvalidSizeAvatar       = errors.New("invalid sizeAvatar error")
	ErrInvalidTypeAvatar       = errors.New("invalid type avatar, supported avatar formats are jpg, jpeg, png, webp, or no animated gif")
	ErrInvalidResolutionAvatar = errors.New("invalid resolution avatar, supported avatar resolution 1x1")
)
