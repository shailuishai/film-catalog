package main

import (
	"context"
	"errors"
	"fmt"
	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
	"github.com/go-chi/cors"
	"github.com/go-chi/httprate"
	"github.com/robfig/cron/v3"
	swag "github.com/swaggo/http-swagger/v2"
	"log/slog"
	"net/http"
	"os"
	"os/signal"
	"server/config"
	"server/docs"
	_ "server/docs"
	"server/internal/init/cache"
	"server/internal/init/database"
	"server/internal/init/elasticsearch"
	"server/internal/init/s3"
	actorC "server/internal/modules/a/controller"
	actorRp "server/internal/modules/a/repo"
	actorCh "server/internal/modules/a/repo/cache"
	actorDb "server/internal/modules/a/repo/database"
	actorS3 "server/internal/modules/a/repo/s3"
	actorUC "server/internal/modules/a/usecase"
	filmC "server/internal/modules/film/controller"
	filmRp "server/internal/modules/film/repo"
	filmCh "server/internal/modules/film/repo/cache"
	filmDb "server/internal/modules/film/repo/database"
	filmES "server/internal/modules/film/repo/elasticsearch"
	filmS3 "server/internal/modules/film/repo/s3"
	filmUC "server/internal/modules/film/usecase"
	genreC "server/internal/modules/genre/controller"
	genreRp "server/internal/modules/genre/repo"
	genreCh "server/internal/modules/genre/repo/cache"
	genreDb "server/internal/modules/genre/repo/database"
	genreUC "server/internal/modules/genre/usecase"
	reviewC "server/internal/modules/review/controller"
	reviewRp "server/internal/modules/review/repo"
	reviewCh "server/internal/modules/review/repo/cache"
	reviewDb "server/internal/modules/review/repo/database"
	reviewUC "server/internal/modules/review/usecase"
	authC "server/internal/modules/user/auth/controller"
	authRp "server/internal/modules/user/auth/repo"
	authCh "server/internal/modules/user/auth/repo/cache"
	authDb "server/internal/modules/user/auth/repo/database"
	authUC "server/internal/modules/user/auth/usecase"
	emailC "server/internal/modules/user/email/controller"
	emailRp "server/internal/modules/user/email/repo"
	emailCh "server/internal/modules/user/email/repo/cache"
	emailDb "server/internal/modules/user/email/repo/database"
	emailUC "server/internal/modules/user/email/usecase"
	profileC "server/internal/modules/user/profile/controller"
	profileRp "server/internal/modules/user/profile/repo"
	profileDb "server/internal/modules/user/profile/repo/database"
	profileS3 "server/internal/modules/user/profile/repo/s3"
	profileUC "server/internal/modules/user/profile/usecase"
	"server/pkg/lib/TaskService"
	"server/pkg/lib/emailsender"
	middleAuth "server/pkg/middleware/jwt"
	middlelog "server/pkg/middleware/logger"
	"syscall"
	"time"
)

type App struct {
	Storage     *database.Storage
	Cache       *cache.Cache
	S3          *s3.S3Storage
	ES          *elasticsearch.Search
	EmailSender *emailsender.EmailSender
	Router      chi.Router
	Log         *slog.Logger
	Cfg         *config.Config
	Cron        *cron.Cron
	TS          *TaskService.TaskService
}

func NewApp(cfg *config.Config, log *slog.Logger) (*App, error) {

	Storage, err := database.NewStorage(cfg.DbConfig)
	if err != nil {
		return nil, fmt.Errorf("db init failed: %w", err)
	}

	Cache, err := cache.NewCache(cfg.CacheConfig)
	if err != nil {
		return nil, fmt.Errorf("cache init failed: %w", err)
	}

	s3s, err := s3.NewS3Storage(cfg.S3Config)
	if err != nil {
		return nil, fmt.Errorf("s3 init failed: %w", err)
	}

	es, err := elasticsearch.NewSearch(cfg.ElasticsearchConfig)
	if err != nil {
		return nil, fmt.Errorf("elastic init failed: %w", err)
	}

	eSender, err := emailsender.New(cfg.SMTPConfig)
	if err != nil {
		return nil, fmt.Errorf("email sender init failed: %w", err)
	}

	router := chi.NewRouter()

	taskService := TaskService.NewTaskService(Storage.Db, log)

	c := cron.New()
	_, err = c.AddFunc("0 0 * * *", func() {
		taskService.CleanUnverifiedUsers()
	})
	if err != nil {
		return nil, fmt.Errorf("cron init failed: %w", err)
	}
	c.Start()

	return &App{Storage: Storage, Cache: Cache, S3: s3s, ES: es, EmailSender: eSender, Router: router, Log: log, Cfg: cfg, Cron: c, TS: taskService}, nil
}

func (app *App) Start() error {
	srv := &http.Server{
		Addr:         app.Cfg.HttpServerConfig.Address,
		Handler:      app.Router,
		ReadTimeout:  app.Cfg.HttpServerConfig.Timeout,
		WriteTimeout: app.Cfg.HttpServerConfig.Timeout,
		IdleTimeout:  app.Cfg.HttpServerConfig.IdleTimeout,
	}

	go func() {
		if err := srv.ListenAndServe(); err != nil && !errors.Is(err, http.ErrServerClosed) {
			app.Log.Error("server error", slog.String("error", err.Error()))
		}
	}()

	app.Log.Info("server started", slog.String("Addr", app.Cfg.HttpServerConfig.Address))
	app.Log.Info("docs " + "https://film-catalog-8re5.onrender.com/swagger/index.html#/")

	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)

	<-quit

	app.Cron.Stop()

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	if err := srv.Shutdown(ctx); err != nil {
		return fmt.Errorf("server shutdown failed: %w", err)
	}

	app.Log.Info("server stopped gracefully")
	return nil
}

func (app *App) SetupRoutes() {

	app.Router.Use(
		middleware.Recoverer,
		middleware.RequestID,
		middlelog.New(app.Log),
		middleware.URLFormat,
		cors.Handler(cors.Options{
			AllowedOrigins:   []string{"https://local.dev:5173", "https://192.168.0.107:5173", "https://192.168.43.193:5173"}, // Укажите домен вашего фронтенда
			AllowedMethods:   []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
			AllowedHeaders:   []string{"Accept", "Authorization", "Content-Type", "X-CSRF-Token"},
			ExposedHeaders:   []string{"Link"},
			AllowCredentials: true,
			MaxAge:           300, // Максимальное время кэширования preflight запросов
		}),
	)

	//Swagger UI endpoint
	app.Router.Get("/swagger/*", swag.Handler(
		swag.URL("https://film-catalog-8re5.onrender.com/swagger/doc.json"),
	))
	apiVersion := "/v1"

	AuthDB := authDb.NewAuthDatabase(app.Storage.Db, app.Log)
	AuthCh := authCh.NewAuthCache(app.Cache)
	AuthRp := authRp.NewRepo(AuthDB, AuthCh)
	AuthUC := authUC.NewAuthUseCase(app.Log, AuthRp)
	AuthC := authC.NewAuthController(app.Log, AuthUC)

	app.Router.Route(apiVersion+"/auth", func(r chi.Router) {
		r.Post("/sign-up", AuthC.SignUp)
		r.Post("/sign-in", AuthC.SignIn)
		r.Post("/refresh-token", AuthC.RefreshToken)
		r.Get("/{provider}", AuthC.Oauth)
		r.Get("/{provider}/callback", AuthC.OauthCallback)
		r.Post("/logout", AuthC.Logout)
	})

	EmailDB := emailDb.NewEmailDatabase(app.Storage.Db, app.Log)
	EmailCh := emailCh.NewEmailCache(app.Cache)
	EmailRp := emailRp.NewEmailRepo(EmailDB, EmailCh)
	EmailUC := emailUC.NewEmailUseCase(app.Log, EmailRp, app.EmailSender)
	EmailC := emailC.NewEmailController(app.Log, EmailUC)

	app.Router.Route(apiVersion+"/email", func(r chi.Router) {
		r.Group(func(r chi.Router) {
			r.Use(httprate.Limit(1, 1*time.Minute, httprate.WithKeyFuncs(httprate.KeyByIP)))
			r.Post("/send-code", EmailC.SendConfirmedEmailCode)
		})
		r.Put("/confirm", EmailC.EmailConfirmed)
	})

	ProfileDB := profileDb.NewProfileDatabase(app.Storage.Db, app.Log)
	ProfileS3 := profileS3.NewProfileS3(app.Log, app.S3)
	ProfileRp := profileRp.NewProfileRepo(ProfileDB, ProfileS3)
	ProfileUC := profileUC.NewProfileUseCase(app.Log, ProfileRp)
	ProfileC := profileC.NewProfileController(app.Log, ProfileUC)

	var AuthMiddleware = middleAuth.NewUserAuth(app.Log)
	var AuthAdminMiddleware = middleAuth.NewAdminAuth(app.Log)

	app.Router.Route(apiVersion+"/profile", func(r chi.Router) {
		r.Use(AuthMiddleware)
		r.Get("/", ProfileC.GetUser)
		r.Put("/", ProfileC.UpdateUser)
		r.Delete("/", ProfileC.DeleteUser)
	})

	ActorDB := actorDb.NewActorDatabase(app.Storage.Db, app.Log)
	ActorS3 := actorS3.NewActorS3(app.Log, app.S3)
	ActorCh := actorCh.NewActorCahce(app.Cache)
	ActorRp := actorRp.NewActorRepo(ActorDB, ActorS3, ActorCh)
	ActorUC := actorUC.NewActorUseCase(app.Log, ActorRp)
	ActorC := actorC.NewActorController(app.Log, ActorUC)

	app.Router.Route(apiVersion+"/actors", func(r chi.Router) {
		r.Get("/", ActorC.GetActors)
		r.Get("/{id}", ActorC.GetActor)
	})

	GenreDB := genreDb.NewGenreDatabase(app.Storage.Db, app.Log)
	GenreCH := genreCh.NewGenreCache(app.Log, app.Cache)
	GenreRp := genreRp.NewGenreRepo(GenreDB, GenreCH)
	GenreUC := genreUC.NewGenreUsecase(GenreRp, app.Log)
	GenreC := genreC.NewGenreController(app.Log, GenreUC)

	app.Router.Route(apiVersion+"/genres", func(r chi.Router) {
		r.Get("/", GenreC.GetGenres)
		r.Get("/{id}", GenreC.GetGenre)
	})

	ReviewDB := reviewDb.NewReviewDatabase(app.Storage.Db, app.Log)
	ReviewCh := reviewCh.NewReviewCache(app.Log, app.Cache)
	ReviewRp := reviewRp.NewReviewRepo(ReviewDB, ReviewCh)
	ReviewUC := reviewUC.NewReviewUseCase(ReviewRp, app.Log)
	ReviewC := reviewC.NewReviewController(app.Log, ReviewUC)

	app.Router.Route(apiVersion+"/reviews", func(r chi.Router) {
		r.Get("/{id}", ReviewC.GetReview)
		r.Get("/film/{film_id}", ReviewC.GetReviewsByFilmID)
		r.Group(func(r chi.Router) {
			r.Use(AuthMiddleware)
			r.Post("/", ReviewC.CreateReview)
			r.Put("/{id}", ReviewC.UpdateReview)
			r.Delete("/{id}", ReviewC.DeleteReview)
			r.Get("/user", ReviewC.GetReviewsByReviewerID)
		})
	})

	FilmDB := filmDb.NewFilmDatabase(app.Storage.Db, app.Log)
	FilmCH := filmCh.NewFilmCache(app.Cache)
	FilmS3 := filmS3.NewFilmS3(app.Log, app.S3)
	FilmES := filmES.NewFilmEs(app.Log, app.ES)
	FilmRp := filmRp.NewFilmRepo(FilmDB, FilmCH, FilmS3, FilmES)
	FilmUC := filmUC.NewFilmUsecase(FilmRp, app.Log)
	FilmC := filmC.NewFilmController(app.Log, FilmUC)

	// Настройка маршрутов для Film
	app.Router.Route(apiVersion+"/films", func(r chi.Router) {
		r.Get("/", FilmC.GetFilms)
		r.Get("/{id}", FilmC.GetFilmByID)
		r.Get("/search", FilmC.SearchFilms)
	})

	app.Router.Route(apiVersion+"/admin", func(r chi.Router) {
		r.Use(AuthAdminMiddleware)
		r.Route("/films", func(r chi.Router) {
			r.Post("/", FilmC.CreateFilm)
			r.Put("/{id}", FilmC.UpdateFilm)
			r.Delete("/{id}", FilmC.DeleteFilm)
			r.Delete("/", FilmC.AdminMultiDeleteFilms)
			r.Get("/", FilmC.AdminGetAllFilms)
		})
		r.Route("/actors", func(r chi.Router) {
			r.Post("/", ActorC.CreateActor)
			r.Put("/{id}", ActorC.UpdateActor)
			r.Delete("/{id}", ActorC.DeleteActor)
			r.Get("/", ActorC.AdminGetAllActors)
			r.Delete("/", ActorC.AdminMultiDeleteActors)
		})
		r.Route("/users", func(r chi.Router) {
			r.Get("/", ProfileC.AdminGetAllUsers)
			r.Delete("/{id}", ProfileC.AdminDeleteUser)
			r.Delete("/", ProfileC.AdminMultiDeleteUsers)
		})
		r.Route("/reviews", func(r chi.Router) {
			r.Post("/", ReviewC.AdminCreateReview)
			r.Put("/", ReviewC.AdminUpdateReview)
			r.Delete("/{id}", ReviewC.AdminDeleteReview)
			r.Delete("/", ReviewC.AdminMultiDeleteReview)
			r.Get("/", ReviewC.AdminGetAllReviews)
		})
		r.Route("/genres", func(r chi.Router) {
			r.Post("/", GenreC.CreateGenre)
			r.Put("/", GenreC.UpdateGenre)
			r.Delete("/{id}", GenreC.DeleteGenre)
			r.Delete("/", GenreC.AdminMultiDeleteGenre)
			r.Get("/", GenreC.GetGenres)
		})
	})
}

// @title Film-catalog API
// @version 1.0.0
// @description API for potatorate site

// @contact.name Evdokimov Igor
// @contact.url https://t.me/epelptic

// @host film-catalog-8re5.onrender.com
// @BasePath /v1
// @Schemes https

// @securityDefinitions.apikey ApiKeyAuth
// @in header
// @name Authorization
func main() {
	docs.SwaggerInfo.Host = "film-catalog-8re5.onrender.com"
	docs.SwaggerInfo.BasePath = "/v1"
	docs.SwaggerInfo.Schemes = []string{"https"}

	cfg := config.MustLoad()
	log := SetupLogger(cfg.Env)

	app, err := NewApp(cfg, log)
	if err != nil {
		log.Error("app init failed", slog.String("error", err.Error()))
		os.Exit(1)
	}

	app.SetupRoutes()

	if err := app.Start(); err != nil {
		log.Error("server error", slog.String("error", err.Error()))
		os.Exit(1)
	}
}

func SetupLogger(env string) (log *slog.Logger) {
	switch env {
	case "local":
		log = slog.New(
			slog.NewTextHandler(os.Stdout, &slog.HandlerOptions{Level: slog.LevelDebug}))
	case "dev":
		log = slog.New(
			slog.NewJSONHandler(os.Stdout, &slog.HandlerOptions{Level: slog.LevelDebug}))
	}
	return log
}
