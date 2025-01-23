package controller

type CreateReviewRequest struct {
	UserID     uint   `json:"user_id" validate:"omitempty"`
	FilmID     uint   `json:"film_id" validate:"required"`
	Rating     int    `json:"rating" validate:"required,min=0,max=100"`
	ReviewText string `json:"review_text" validate:"required"`
}

type UpdateReviewRequest struct {
	ReviewID   uint   `json:"review_id" validate:"required"`
	Rating     int    `json:"rating" validate:"required,min=0,max=100"`
	ReviewText string `json:"review_text" validate:"required"`
}
