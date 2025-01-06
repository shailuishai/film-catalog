package main

import (
	"context"
	"errors"
	"fmt"
	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
	"github.com/go-chi/httprate"
	"github.com/robfig/cron/v3"
	swag "github.com/swaggo/http-swagger/v2"
	"log/slog"
	"net/http"
	"os"
	"os/signal"
	"server/config"
	_ "server/docs"
	"server/internal/init/cache"
	"server/internal/init/database"
	"server/internal/init/s3"
	actorC "server/internal/modules/actor/controller"
	actorRp "server/internal/modules/actor/repo"
	actorCh "server/internal/modules/actor/repo/cache"
	actorDb "server/internal/modules/actor/repo/database"
	actorS3 "server/internal/modules/actor/repo/s3"
	actorUC "server/internal/modules/actor/usecase"
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

	return &App{Storage: Storage, Cache: Cache, S3: s3s, EmailSender: eSender, Router: router, Log: log, Cfg: cfg, Cron: c, TS: taskService}, nil
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
	app.Log.Info("docs " + "http://" + app.Cfg.HttpServerConfig.Address + "/swagger/index.html#/")

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
	)

	//Swagger UI endpoint
	app.Router.Get("/swagger/*", swag.Handler(
		swag.URL("http://localhost:8079/swagger/doc.json"),
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

	var AuthMiddleware = middleAuth.New(app.Log)
	//var AuthAdminMiddleware = middleAdmin.New(app.Log)

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
		r.Group(func(r chi.Router) {
			// r.Use(AuthMiddleware, AdminMiddleware)
			r.Post("/", ActorC.CreateActor)
			r.Put("/{id}", ActorC.UpdateActor)
			r.Delete("/{id}", ActorC.DeleteActor)
		})
	})
}

// @title Film-catalog API
// @version 1.0.0
// @description API for potatorate site
// @contact.name Evdokimov Igor
// @contact.url https://t.me/epelptic
// @BasePath /v1
// @securityDefinitions.apikey ApiKeyAuth
// @in header
// @name Authorization
func main() {
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
