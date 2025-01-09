package response

import (
	"errors"
	"fmt"
	"github.com/go-playground/validator/v10"
	act "server/internal/modules/actor"
	f "server/internal/modules/film"
	g "server/internal/modules/genre"
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
	ID          uint          `json:"id"`
	PosterURL   string        `json:"poster_url"`
	Synopsis    string        `json:"synopsis"`
	ReleaseDate time.Time     `json:"release_date"`
	Runtime     time.Duration `json:"runtime"`
	Producer    string        `json:"producer"`
	CreatedAt   time.Time     `json:"created_at"`

	AvgRating          float64 `json:"avg_rating"`
	TotalReviews       uint    `json:"total_reviews"`
	CountRatings0_20   uint    `json:"count_ratings_0_20"`
	CountRatings21_40  uint    `json:"count_ratings_21_40"`
	CountRatings41_60  uint    `json:"count_ratings_41_60"`
	CountRatings61_80  uint    `json:"count_ratings_61_80"`
	CountRatings81_100 uint    `json:"count_ratings_81_100"`

	Genres  []uint `json:"genres"`
	Actors  []uint `json:"actors"`
	Reviews []uint `json:"reviews"`
}

func Films(films interface{}) Response {
	switch v := films.(type) {
	case *f.FilmDTO:
		return Response{
			Status: StatusOK,
			Data: FilmData{
				ID:          v.ID,
				PosterURL:   v.PosterURL,
				Synopsis:    v.Synopsis,
				ReleaseDate: v.ReleaseDate,
				Runtime:     v.Runtime,
				Producer:    v.Producer,
				CreatedAt:   v.CreatedAt,

				AvgRating:          v.AvgRating,
				TotalReviews:       v.TotalReviews,
				CountRatings0_20:   v.CountRatings0_20,
				CountRatings21_40:  v.CountRatings21_40,
				CountRatings41_60:  v.CountRatings41_60,
				CountRatings61_80:  v.CountRatings61_80,
				CountRatings81_100: v.CountRatings81_100,

				Genres: v.Genres,
				Actors: v.Actors,
			},
		}
	case []*f.FilmDTO:
		var filmList []FilmData
		for _, film := range v {
			filmList = append(filmList, FilmData{
				ID:          film.ID,
				PosterURL:   film.PosterURL,
				Synopsis:    film.Synopsis,
				ReleaseDate: film.ReleaseDate,
				Runtime:     film.Runtime,
				Producer:    film.Producer,
				CreatedAt:   film.CreatedAt,

				AvgRating:          film.AvgRating,
				TotalReviews:       film.TotalReviews,
				CountRatings0_20:   film.CountRatings0_20,
				CountRatings21_40:  film.CountRatings21_40,
				CountRatings41_60:  film.CountRatings41_60,
				CountRatings61_80:  film.CountRatings61_80,
				CountRatings81_100: film.CountRatings81_100,

				Genres: film.Genres,
				Actors: film.Actors,
			})
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
