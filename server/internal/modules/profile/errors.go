package profile

import "errors"

var (
	ErrInvalidResolutionAvatar = errors.New("invalid resolution avatar(must be 1x1)")
	ErrInvalidTypeAvatar       = errors.New("invalid type avatar")
	ErrSizeAvatar              = errors.New("size of avatar image is large(required <1MB)")
	ErrUserNotFound            = errors.New("user not found")
	ErrInvalidState            = errors.New("invalid state")
)
