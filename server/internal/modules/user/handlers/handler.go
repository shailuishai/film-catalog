package handlers

import (
	"github.com/go-playground/validator/v10"
	"log/slog"
	"server/internal/modules/user"
)

type UserClient struct {
	log      *slog.Logger
	us       user.UserService
	validate *validator.Validate
}

func NewUserClient(log *slog.Logger, aus user.UserService) user.UserHandler {
	validate := validator.New()
	validate.RegisterStructValidation(loginOrEmailValidation, UserSignInRequest{})
	return &UserClient{
		log:      log,
		us:       aus,
		validate: validate,
	}
}

func loginOrEmailValidation(sl validator.StructLevel) {
	data := sl.Current().Interface().(UserSignInRequest)

	if data.Login == "" && data.Email == "" {
		sl.ReportError(data.Login, "Login", "login", "login_or_email_required", "")
	}
}
