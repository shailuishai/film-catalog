package email

import "errors"

var (
	ErrEmailExists           = errors.New("user with this email already exists")
	ErrEmailNotConfirmed     = errors.New("email not confirmed")
	ErrEmailAlreadyConfirmed = errors.New("email already confirmed")
	ErrInvalidConfirmCode    = errors.New("invalid confirm code")
)
