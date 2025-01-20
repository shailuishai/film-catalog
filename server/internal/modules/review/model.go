package review

import "time"

type Review struct {
	ReviewID   uint      `gorm:"primaryKey;column:review_id"`
	UserID     uint      `gorm:"column:user_id;uniqueIndex:idx_user_film"`
	FilmID     uint      `gorm:"column:film_id;uniqueIndex:idx_user_film"`
	Rating     int       `gorm:"column:rating"`
	ReviewText string    `gorm:"column:review_text"`
	CreatedAt  time.Time `gorm:"column:create_at"`
}

type ReviewWithDetails struct {
	Review
	UserAvatarURL string `gorm:"column:user_avatar_url"`
	UserLogin     string `gorm:"column:user_login"`
	FilmPosterURL string `gorm:"column:film_poster_url"`
	FilmTitle     string `gorm:"column:film_title"`
}

func (r *Review) ToDTO(userAvatarURL, filmPosterURL, userLogin, filmTitle string) *ReviewDTO {
	return &ReviewDTO{
		ReviewID:      r.ReviewID,
		UserID:        r.UserID,
		UserAvatarURL: userAvatarURL,
		UserLogin:     userLogin,
		FilmID:        r.FilmID,
		FilmPosterURL: filmPosterURL,
		FilmTitle:     filmTitle,
		Rating:        r.Rating,
		ReviewText:    r.ReviewText,
		CreateAt:      r.CreatedAt,
	}
}

func (r *ReviewDTO) ToModel() *Review {
	return &Review{
		ReviewID:   r.ReviewID,
		UserID:     r.UserID,
		FilmID:     r.FilmID,
		Rating:     r.Rating,
		ReviewText: r.ReviewText,
		CreatedAt:  r.CreateAt,
	}
}

func ToDTOList(reviews []*ReviewWithDetails) []*ReviewDTO {
	var dtos []*ReviewDTO
	for _, review := range reviews {
		dtos = append(dtos, review.ToDTO(review.UserAvatarURL, review.FilmPosterURL, review.UserLogin, review.FilmTitle))
	}
	return dtos
}
