package genre

import "time"

type Genre struct {
	GenreID  uint      `gorm:"primaryKey;autoIncrement;column:genre_id" json:"genre_id"`
	Name     string    `gorm:"size:200;unique;not null;column:name" json:"name"`
	CreateAt time.Time `gorm:"default:CURRENT_DATE;column:create_at" json:"created_at"`
}

func FromDTO(DTO *GenreDTO) *Genre {
	return &Genre{
		GenreID:  DTO.GenreId,
		Name:     DTO.Name,
		CreateAt: DTO.CreateAt,
	}
}

func ToDTO(genre *Genre) *GenreDTO {
	return &GenreDTO{
		GenreId:  genre.GenreID,
		Name:     genre.Name,
		CreateAt: genre.CreateAt,
	}
}
