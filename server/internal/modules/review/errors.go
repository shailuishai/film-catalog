package review

import "errors"

var (
	ErrUnauthorized = errors.New("you can edit and delete also your reviews")
	ErrMissCache    = errors.New("miss cache error")
	ErrInternal     = errors.New("internal server error")
	ErrNoSuchReview = errors.New("no such review")
	ErrReviewExists = errors.New("review exists")
)
