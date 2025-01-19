package film

import (
	"fmt"
	"server/internal/modules/a"
	g "server/internal/modules/genre"
	"strconv"
	"strings"
	"time"
)

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

func (FilmStatsModel) TableName() string {
	return "film_stats" // или "film_genres", в зависимости от базы данных
}

type FilmGenre struct {
	FilmID  uint `gorm:"primaryKey;column:film_id"`
	GenreID uint `gorm:"primaryKey;column:genre_id"`
}

func (FilmGenre) TableName() string {
	return "film_genre" // или "film_genres", в зависимости от базы данных
}

type FilmActor struct {
	FilmID  uint `gorm:"primaryKey;column:film_id"`
	ActorID uint `gorm:"primaryKey;column:actor_id"`
}

func (FilmActor) TableName() string {
	return "film_actor" // или "film_genres", в зависимости от базы данных
}

type Film struct {
	FilmId      uint      `gorm:"primaryKey;column:film_id;autoIncrement"`
	Title       string    `gorm:"column:title;type:text;not null;default:'фильмец под чипсики'"`
	PosterURL   string    `gorm:"default:'https://filmposter.storage-173.s3hoster.by/default/';column:poster_url"`
	Synopsis    string    `gorm:"column:synopsis;type:text;not null;default:'-'"`
	ReleaseDate time.Time `gorm:"column:release_date;type:date;not null"`
	Runtime     int       `gorm:"column:runtime;type:int;not null;default:90"`
	Producer    string    `gorm:"column:producer;type:varchar(255);not null;default:'Неизвестен'"`
	CreatedAt   time.Time `gorm:"column:create_at"`
	// Связь с жанрами (полноценные модели)
	Genres []g.Genre `gorm:"many2many:film_genre;joinForeignKey:FilmID;JoinReferences:GenreID"`

	// Связь с актерами (полноценные модели)
	Actors []a.Actor `gorm:"many2many:film_actor;joinForeignKey:FilmID;JoinReferences:ActorID"`
}

func (f *Film) ToDTO(stats *FilmStatsModel) *FilmDTO {
	filmDTO := &FilmDTO{
		ID:          f.FilmId,
		Title:       f.Title,
		PosterURL:   f.PosterURL,
		Synopsis:    f.Synopsis,
		ReleaseDate: f.ReleaseDate,
		Runtime:     minutesToDurationString(f.Runtime),
		Producer:    f.Producer,
		CreateAt:    f.CreatedAt,

		AvgRating:          stats.AvgRating,
		TotalReviews:       stats.TotalReviews,
		CountRatings0_20:   stats.CountRatings0_20,
		CountRatings21_40:  stats.CountRatings21_40,
		CountRatings41_60:  stats.CountRatings41_60,
		CountRatings61_80:  stats.CountRatings61_80,
		CountRatings81_100: stats.CountRatings81_100,
	}

	// Сохраняем FilmId жанров
	for _, genre := range f.Genres {
		filmDTO.GenreIDs = append(filmDTO.GenreIDs, genre.GenreID)
		filmDTO.Genres = append(filmDTO.Genres, *g.ToDTO(&genre))
	}

	// Сохраняем ActorID и ActorDTO
	for _, actor := range f.Actors {
		filmDTO.ActorIDs = append(filmDTO.ActorIDs, actor.ActorID)
		filmDTO.Actors = append(filmDTO.Actors, *a.ToDTO(&actor))
	}

	return filmDTO
}

func (f *FilmDTO) ToModel() (*Film, *FilmStatsModel) {
	film := &Film{
		FilmId:      f.ID,
		Title:       f.Title,
		PosterURL:   f.PosterURL,
		Synopsis:    f.Synopsis,
		ReleaseDate: f.ReleaseDate,
		Runtime:     durationStringToMinutes(f.Runtime),
		Producer:    f.Producer,
		CreatedAt:   f.CreateAt,
	}

	// Восстанавливаем связи с жанрами
	for _, genreID := range f.GenreIDs {
		film.Genres = append(film.Genres, g.Genre{GenreID: genreID})
	}

	// Восстанавливаем связи с актерами
	for _, actorID := range f.ActorIDs {
		film.Actors = append(film.Actors, a.Actor{ActorID: actorID})
	}

	filmStats := &FilmStatsModel{
		FilmID:             f.ID,
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

func minutesToDurationString(minutes int) string {
	hours := minutes / 60
	remainingMinutes := minutes % 60

	return fmt.Sprintf("%dh%dm", hours, remainingMinutes)
}

func durationStringToMinutes(durationString string) int {
	durationString = strings.ReplaceAll(durationString, " ", "")
	hours := 0
	minutes := 0

	parts := strings.Split(durationString, "h")
	if len(parts) == 2 {
		hours, _ = strconv.Atoi(parts[0])
		durationString = parts[1]
	}

	parts = strings.Split(durationString, "m")
	if len(parts) >= 1 {
		minutes, _ = strconv.Atoi(parts[0])
	}

	return hours*60 + minutes
}
