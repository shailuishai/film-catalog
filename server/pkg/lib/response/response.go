package response

import (
	"errors"
	"fmt"
	"github.com/go-playground/validator/v10"
	act "server/internal/modules/a"
	f "server/internal/modules/film"
	g "server/internal/modules/genre"
	r "server/internal/modules/review"
	u "server/internal/modules/user/profile"
	"strings"
	"time"
)

// Response represents the general structure of an API response
// @Description Structure for a standard API response
type Response struct {
	Status string      `json:"status" example:"success/error"`
	Error  string      `json:"error,omitempty" example:"any error"`
	Data   interface{} `json:"data,omitempty"`
}

const (
	StatusOK    = "success"
	StatusError = "error"
)

type AccessTokenData struct {
	AccessToken string `json:"access_token"`
}

type UserProfileData struct {
	Email     *string `json:"email,omitempty"`
	Login     *string `json:"login,omitempty"`
	AvatarUrl *string `json:"avatar_url"`
}

func UserProfile(user *u.UserProfile) Response {
	return Response{
		Status: StatusOK,
		Data: UserProfileData{
			Email:     user.Email,
			Login:     user.Login,
			AvatarUrl: user.AvatarUrl,
		},
	}
}

type ActorData struct {
	Id        uint       `json:"actor_id"`
	Name      *string    `json:"name,omitempty"`
	WikiUrl   *string    `json:"wiki_url,omitempty"`
	AvatarUrl *string    `json:"avatar_url"`
	CreatedAt *time.Time `json:"created_at"`
}

func Actors(actors interface{}) Response {
	switch v := actors.(type) {
	case *act.ActorDTO:
		return Response{
			Status: StatusOK,
			Data: ActorData{
				Id:        v.ActorId,
				Name:      &v.Name,
				WikiUrl:   &v.WikiUrl,
				AvatarUrl: v.AvatarUrl,
				CreatedAt: &v.CreatedAt,
			},
		}
	case []*act.ActorDTO:
		var actors []ActorData
		for _, actor := range v {
			actors = append(actors, ActorData{
				Id:        actor.ActorId,
				Name:      &actor.Name,
				WikiUrl:   &actor.WikiUrl,
				AvatarUrl: actor.AvatarUrl,
				CreatedAt: &actor.CreatedAt,
			})
		}
		return Response{
			Status: StatusOK,
			Data:   actors,
		}
	default:
		return Response{
			Status: StatusError,
			Error:  "invalid server error",
		}
	}
}

type GenreData struct {
	Id        uint       `json:"genre_id"`
	Name      *string    `json:"name,omitempty"`
	CreatedAt *time.Time `json:"created_at"`
}

func Genres(genres interface{}) Response {
	switch v := genres.(type) {
	case *g.GenreDTO:
		return Response{
			Status: StatusOK,
			Data: GenreData{
				Id:        v.GenreId,
				Name:      &v.Name,
				CreatedAt: &v.CreateAt,
			},
		}
	case []*g.GenreDTO:
		var genres []GenreData
		for _, genre := range v {
			genres = append(genres, GenreData{
				Id:        genre.GenreId,
				Name:      &genre.Name,
				CreatedAt: &genre.CreateAt,
			})
		}
		return Response{
			Status: StatusOK,
			Data:   genres,
		}
	default:
		return Response{
			Status: StatusError,
			Error:  "invalid server error",
		}
	}
}

type FilmData struct {
	ID          uint      `json:"id"`
	Title       string    `json:"title"`
	PosterURL   string    `json:"poster_url"`
	Synopsis    string    `json:"synopsis"`
	ReleaseDate time.Time `json:"release_date"`
	Runtime     string    `json:"runtime"`
	Producer    string    `json:"producer"`
	CreatedAt   time.Time `json:"created_at"`

	AvgRating          float64 `json:"avg_rating"`
	TotalReviews       uint    `json:"total_reviews"`
	CountRatings0_20   uint    `json:"count_ratings_0_20"`
	CountRatings21_40  uint    `json:"count_ratings_21_40"`
	CountRatings41_60  uint    `json:"count_ratings_41_60"`
	CountRatings61_80  uint    `json:"count_ratings_61_80"`
	CountRatings81_100 uint    `json:"count_ratings_81_100"`

	GenreIDs []uint      `json:"genre_ids,omitempty"` // Только ID жанров
	ActorIDs []uint      `json:"actor_ids,omitempty"` // Только ID актеров
	Genres   []GenreData `json:"genres,omitempty"`    // Полные данные жанров
	Actors   []ActorData `json:"actors,omitempty"`    // Полные данные актеров
}

func Films(films interface{}) Response {
	switch v := films.(type) {
	case *f.FilmDTO:
		filmData := FilmData{
			ID:          v.ID,
			Title:       v.Title,
			PosterURL:   v.PosterURL,
			Synopsis:    v.Synopsis,
			ReleaseDate: v.ReleaseDate,
			Runtime:     v.Runtime,
			Producer:    v.Producer,
			CreatedAt:   v.CreateAt,

			AvgRating:          v.AvgRating,
			TotalReviews:       v.TotalReviews,
			CountRatings0_20:   v.CountRatings0_20,
			CountRatings21_40:  v.CountRatings21_40,
			CountRatings41_60:  v.CountRatings41_60,
			CountRatings61_80:  v.CountRatings61_80,
			CountRatings81_100: v.CountRatings81_100,
		}

		// Если переданы только FilmId жанров
		if len(v.GenreIDs) > 0 {
			filmData.GenreIDs = v.GenreIDs
		}

		// Если переданы полные данные жанров
		if len(v.Genres) > 0 {
			genres := make([]GenreData, len(v.Genres))
			for i, genre := range v.Genres {
				genres[i] = GenreData{
					Id:        genre.GenreId,
					Name:      &genre.Name,
					CreatedAt: &genre.CreateAt,
				}
			}
			filmData.Genres = genres
		}

		// Если переданы только FilmId актеров
		if len(v.ActorIDs) > 0 {
			filmData.ActorIDs = v.ActorIDs
		}

		// Если переданы полные данные актеров
		if len(v.Actors) > 0 {
			actors := make([]ActorData, len(v.Actors))
			for i, actor := range v.Actors {
				actors[i] = ActorData{
					Id:        actor.ActorId,
					Name:      &actor.Name,
					WikiUrl:   &actor.WikiUrl,
					AvatarUrl: actor.AvatarUrl,
					CreatedAt: &actor.CreatedAt,
				}
			}
			filmData.Actors = actors
		}

		return Response{
			Status: StatusOK,
			Data:   filmData,
		}

	case []*f.FilmDTO:
		var filmList []FilmData
		for _, film := range v {
			filmData := FilmData{
				ID:                 film.ID,
				Title:              film.Title,
				PosterURL:          film.PosterURL,
				Synopsis:           film.Synopsis,
				ReleaseDate:        film.ReleaseDate,
				Runtime:            film.Runtime,
				Producer:           film.Producer,
				CreatedAt:          film.CreateAt,
				AvgRating:          film.AvgRating,
				TotalReviews:       film.TotalReviews,
				CountRatings0_20:   film.CountRatings0_20,
				CountRatings21_40:  film.CountRatings21_40,
				CountRatings41_60:  film.CountRatings41_60,
				CountRatings61_80:  film.CountRatings61_80,
				CountRatings81_100: film.CountRatings81_100,
			}

			// Если переданы только FilmId жанров
			if len(film.GenreIDs) > 0 {
				filmData.GenreIDs = film.GenreIDs
			}

			// Если переданы полные данные жанров
			if len(film.Genres) > 0 {
				genres := make([]GenreData, len(film.Genres))
				for i, genre := range film.Genres {
					genres[i] = GenreData{
						Id:        genre.GenreId,
						Name:      &genre.Name,
						CreatedAt: &genre.CreateAt,
					}
				}
				filmData.Genres = genres
			}

			// Если переданы только FilmId актеров
			if len(film.ActorIDs) > 0 {
				filmData.ActorIDs = film.ActorIDs
			}

			// Если переданы полные данные актеров
			if len(film.Actors) > 0 {
				actors := make([]ActorData, len(film.Actors))
				for i, actor := range film.Actors {
					actors[i] = ActorData{
						Id:        actor.ActorId,
						Name:      &actor.Name,
						WikiUrl:   &actor.WikiUrl,
						AvatarUrl: actor.AvatarUrl,
						CreatedAt: &actor.CreatedAt,
					}
				}
				filmData.Actors = actors
			}

			filmList = append(filmList, filmData)
		}
		return Response{
			Status: StatusOK,
			Data:   filmList,
		}

	default:
		return Response{
			Status: StatusError,
			Error:  "invalid server error",
		}
	}
}

type ReviewData struct {
	ReviewID      uint       `json:"review_id"`
	UserID        uint       `json:"user_id"`
	UserAvatarURL string     `json:"user_avatar_url"`
	FilmID        uint       `json:"film_id"`
	FilmPosterURL string     `json:"film_poster_url"`
	Rating        int        `json:"rating"`
	ReviewText    string     `json:"review_text"`
	CreatedAt     *time.Time `json:"created_at,omitempty"`
}

func Reviews(reviews interface{}) Response {
	switch v := reviews.(type) {
	case *r.ReviewDTO:
		return Response{
			Status: StatusOK,
			Data: ReviewData{
				ReviewID:      v.ReviewID,
				UserID:        v.UserID,
				UserAvatarURL: v.UserAvatarURL,
				FilmID:        v.FilmID,
				FilmPosterURL: v.FilmPosterURL,
				Rating:        v.Rating,
				ReviewText:    v.ReviewText,
				CreatedAt:     &v.CreateAt,
			},
		}
	case []*r.ReviewDTO:
		var reviewList []ReviewData
		for _, review := range v {
			reviewList = append(reviewList, ReviewData{
				ReviewID:      review.ReviewID,
				UserID:        review.UserID,
				UserAvatarURL: review.UserAvatarURL,
				FilmID:        review.FilmID,
				FilmPosterURL: review.FilmPosterURL,
				Rating:        review.Rating,
				ReviewText:    review.ReviewText,
				CreatedAt:     &review.CreateAt,
			})
		}
		return Response{
			Status: StatusOK,
			Data:   reviewList,
		}
	default:
		return Response{
			Status: StatusError,
			Error:  "invalid server error",
		}
	}
}

func AccessToken(token string) Response {
	return Response{
		Status: StatusOK,
		Data: AccessTokenData{
			AccessToken: token,
		},
	}
}

func OK() Response {
	return Response{
		Status: StatusOK,
	}
}

func Error(error string) Response {
	return Response{
		Status: StatusError,
		Error:  error,
	}
}

func ValidationError(err error) Response {
	var errMsgs []string

	var validationErrs validator.ValidationErrors
	if errors.As(err, &validationErrs) {
		for _, err := range validationErrs {
			switch err.ActualTag() {
			case "required":
				errMsgs = append(errMsgs, fmt.Sprintf("field %s is a required field", err.Field()))
			case "email":
				errMsgs = append(errMsgs, fmt.Sprintf("field %s is not a valid Email", err.Field()))
			case "login":
				errMsgs = append(errMsgs, fmt.Sprintf("field %s is not a valid Login", err.Field()))
			default:
				errMsgs = append(errMsgs, fmt.Sprintf("field %s has an invalid value", err.Field()))
			}
		}
	} else {
		errMsgs = append(errMsgs, err.Error())
	}

	return Response{
		Status: StatusError,
		Error:  strings.Join(errMsgs, ", "),
	}
}
