package handlers

type UserSignUpRequest struct {
	Email    string `json:"email" validate:"required,email" example:"jon.doe@gmail.com"`
	Password string `json:"password" validate:"required" example:"SuperPassword123"`
	Login    string `json:"login,omitempty" validate:"omitempty,min=1,max=50" example:"user1"`
}

type UserSignInRequest struct {
	Login    string `json:"login,omitempty" validate:"omitempty,min=1,max=50" example:"user1"`
	Email    string `json:"email,omitempty" validate:"required,email" example:"jon.doe@gmail.com"`
	Password string `json:"password" validate:"required" example:"SuperPassword123"`
}

type SendConfirmedEmailCodeRequest struct {
	Email string `json:"email" validate:"required,email" example:"jon.doe@gmail.com"`
}

type EmailConfirmedRequest struct {
	Code  string `json:"code" validate:"required" example:"54JK64"`
	Email string `json:"email" validate:"required,email" example:"jon.doe@gmail.com"`
}

type UpdateUserRequest struct {
	Login       string `json:"login,omitempty" validate:"omitempty,min=1,max=50" example:"user1"`
	ResetAvatar bool   `json:"reset_avatar,omitempty" validate:"required" example:"false"`
}
