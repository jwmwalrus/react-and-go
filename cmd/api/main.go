package main

import (
	"context"
	"database/sql"
	_ "embed"
	"fmt"
	"log"
	"net/http"
	"os"
	"strconv"
	"time"

	"github.com/joho/godotenv"
	"github.com/jwmwalrus/bumpy-ride/version"
	"github.com/jwmwalrus/react-and-go/models"
	_ "github.com/lib/pq"
)

//go:embed version.json
var versionJSON []byte

var appVersion version.Version

type config struct {
	port int
	env  string
	db   struct {
		dsn string
	}
	jwt struct {
		secret string
	}
}

type application struct {
	config config
	logger *log.Logger
	models models.Models
}

func main() {
	var cfg config

	if port, err := strconv.Atoi(os.Getenv("API_PORT")); err != nil {
		panic(err)
	} else {
		cfg.port = port
	}
	cfg.env = os.Getenv("API_ENV")
	cfg.db.dsn = os.Getenv("API_DB_DSN")
	cfg.jwt.secret = os.Getenv("API_JWT_SECRET")

	cwd, _ := os.Getwd()
	fmt.Println(cwd)
	logger := log.New(os.Stdout, "", log.Ldate|log.Ltime)

	db, err := openDB(cfg)
	if err != nil {
		logger.Fatal(err)
	}
	defer db.Close()

	app := &application{
		config: cfg,
		logger: logger,
		models: models.NewModels(db),
	}

	logger.Println("Starting server on port", cfg.port)

	srv := &http.Server{
		Addr:         fmt.Sprintf(":%d", cfg.port),
		Handler:      app.routes(),
		IdleTimeout:  time.Minute,
		ReadTimeout:  10 * time.Second,
		WriteTimeout: 30 * time.Second,
	}

	err = srv.ListenAndServe()
	if err != nil {
		logger.Println(err)
	}
}

func openDB(cfg config) (*sql.DB, error) {
	db, err := sql.Open("postgres", cfg.db.dsn)
	if err != nil {
		return nil, err
	}

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	err = db.PingContext(ctx)
	if err != nil {
		return nil, err
	}

	return db, nil
}

func init() {
	err := appVersion.Read(versionJSON)
	if err != nil {
		panic(err)
	}

	if _, err := os.Stat(".env.local"); !os.IsNotExist(err) {
		_ = godotenv.Load(".env.local")
	} else {
		_ = godotenv.Load()
	}
}
