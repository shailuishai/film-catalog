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

func (r *Review) ToDTO() *ReviewDTO {
	return &ReviewDTO{
		ReviewID:   r.ReviewID,
		UserID:     r.UserID,
		FilmID:     r.FilmID,
		Rating:     r.Rating,
		ReviewText: r.ReviewText,
		CreateAt:   r.CreatedAt,
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

func ToDTOList(reviews []*Review) []*ReviewDTO {
	var dtos []*ReviewDTO
	for _, review := range reviews {
		dtos = append(dtos, review.ToDTO())
	}
	return dtos
}
