package film

import "time"

type FilmStatsModel struct {
	FilmID             uint    `gorm:"column:film_id"`
	AvgRating          float64 `gorm:"column:avg_rating"`
	TotalReviews       uint    `gorm:"column:total_count_reviews"`
	CountRatings0_20   uint    `gorm:"column:count_0_20"`
	CountRatings21_40  uint    `gorm:"column:count_21_40"`
	CountRatings41_60  uint    `gorm:"column:count_41_60"`
	CountRatings61_80  uint    `gorm:"column:count_61_80"`
	CountRatings81_100 uint    `gorm:"column:count_81_100"`
}

type FilmModel struct {
	ID          uint          `gorm:"primaryKey;column:film_id"`
	PosterURL   string        `gorm:"column:poster_url"`
	Synopsis    string        `gorm:"column:synopsis"`
	ReleaseDate time.Time     `gorm:"column:release_date"`
	Runtime     time.Duration `gorm:"column:runtime"`
	Producer    string        `gorm:"column:producer"`
	CreatedAt   time.Time     `gorm:"column:create_at"`
}

func (f *FilmModel) ToDTO(stats *FilmStatsModel) *FilmDTO {
	return &FilmDTO{
		ID:          f.ID,
		PosterURL:   f.PosterURL,
		Synopsis:    f.Synopsis,
		ReleaseDate: f.ReleaseDate,
		Runtime:     f.Runtime,
		Producer:    f.Producer,
		CreatedAt:   f.CreatedAt,

		AvgRating:          stats.AvgRating,
		TotalReviews:       stats.TotalReviews,
		CountRatings0_20:   stats.CountRatings0_20,
		CountRatings21_40:  stats.CountRatings21_40,
		CountRatings41_60:  stats.CountRatings41_60,
		CountRatings61_80:  stats.CountRatings61_80,
		CountRatings81_100: stats.CountRatings81_100,
	}
}

func (f *FilmDTO) ToModel() (*FilmModel, *FilmStatsModel) {
	film := &FilmModel{
		ID:          f.ID,
		PosterURL:   f.PosterURL,
		Synopsis:    f.Synopsis,
		ReleaseDate: f.ReleaseDate,
		Runtime:     f.Runtime,
		Producer:    f.Producer,
		CreatedAt:   f.CreatedAt,
	}
	filmStats := &FilmStatsModel{
		AvgRating:          f.AvgRating,
		TotalReviews:       f.TotalReviews,
		CountRatings0_20:   f.CountRatings0_20,
		CountRatings21_40:  f.CountRatings21_40,
		CountRatings41_60:  f.CountRatings41_60,
		CountRatings61_80:  f.CountRatings61_80,
		CountRatings81_100: f.CountRatings81_100,
	}
	return film, filmStats
}
