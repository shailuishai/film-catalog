package controller

type CreateGenreRequest struct {
	Name string `json:"name"`
}

type UpdateGenreRequest struct {
	GenreId uint   `json:"genre_id"`
	Name    string `json:"name"`
}
