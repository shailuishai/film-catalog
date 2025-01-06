package controller

type CreateActorRequest struct {
	Name    string `json:"name" validate:"required,min=2,max=100"`
	WikiUrl string `json:"wiki_url" validate:"required,url,wikipedia"`
}

type UpdateActorRequest struct {
	Name        string `json:"name" validate:"omitempty,min=2,max=100"`
	WikiUrl     string `json:"wiki_url" validate:"omitempty,url,wikipedia"`
	ResetAvatar bool   `json:"reset_avatar"`
}

type GetActorsFilterRequest struct {
	Name           *string `json:"name" validate:"omitempty"`
	CreatedAt      *int    `json:"created_at" validate:"omitempty,min=0"`
	MinYear        *int    `json:"min_year" validate:"omitempty,min=0"`
	MaxYear        *int    `json:"max_year" validate:"omitempty,min=0"`
	MinMoviesCount *int    `json:"min_movies_count" validate:"omitempty,min=0"`
	MaxMoviesCount *int    `json:"max_movies_count" validate:"omitempty,min=0"`
	SortBy         *string `json:"sort_by" validate:"omitempty,oneof=create_at movies_count name"`
	Order          *string `json:"order" validate:"omitempty,oneof=asc desc"`
	Page           int     `json:"page" validate:"gte=1"`
	PageSize       int     `json:"page_size" validate:"gte=1,lte=100"`
}
