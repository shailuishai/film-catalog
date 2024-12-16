package main

import (
	"context"
	"errors"
	"fmt"
	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
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
	authC "server/internal/modules/auth/controller"
	authRp "server/internal/modules/auth/repo"
	authCh "server/internal/modules/auth/repo/cache"
	authDb "server/internal/modules/auth/repo/database"
	authUC "server/internal/modules/auth/usecase"
	"server/pkg/lib/emailsender"
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
	return &App{Storage: Storage, Cache: Cache, S3: s3s, EmailSender: eSender, Router: router, Log: log, Cfg: cfg}, nil
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

	// var jwtMiddleware = middleJWT.New(app.Log)

	//Swagger UI endpoint
	app.Router.Get("/swagger/*", swag.Handler(
		swag.URL("http://localhost:8079/swagger/doc.json"),
	))

	apiVersion := "/v1"

	// Группа для аунтификации
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

	//app.Router.Route(apiVersion+"/confirm", func(r chi.Router) {
	//	r.Group(func(r chi.Router) {
	//		r.Use(httprate.Limit(1, 1*time.Minute, httprate.WithKeyFuncs(httprate.KeyByIP)))
	//		r.Post("/send-email-code", UserHandler.SendConfirmedEmailCode)
	//	})
	//	r.Put("/email", UserHandler.EmailConfirmed)
	//})
	//
	//// Группа для пользовательских маршрутов (требует авторизации)
	//app.Router.Route(apiVersion+"/user", func(r chi.Router) {
	//	r.Use(jwtMiddleware)
	//	r.Put("/edit", UserHandler.UpdateUserHandler)
	//	r.Get("/me", UserHandler.GetUserHandler)
	//	r.Delete("/delete", UserHandler.DeleteUserHandler)
	//})

	//// Группа для административных маршрутов
	//app.Router.Route("/admin", func(r chi.Router) {
	//	r.Use(middleJWT.NewCache(app.Log))
	//	//r.Use(middleAdmin)
	//})
	//
	////Группа маршутов для супперадминов для создание админов
	//app.Router.Group(func(r chi.Router) {
	//	r.Use(middleJWT.NewCache(app.Log))
	//	//r.Use(WhiteIpList(WhiteList)
	//	//r.Use(middleSuperAdmin)
	//	//r.Post("/admin/create", auth.CrateAdminHandler(app.Storage, app.Log))
	//})
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
