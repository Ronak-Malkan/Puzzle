package main

import (
	"context"
	"log"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
	"github.com/ronakmalkan/puzzle/auth-service/internal/config"
	"github.com/ronakmalkan/puzzle/auth-service/internal/handlers"
	"github.com/ronakmalkan/puzzle/auth-service/internal/middleware"
	"github.com/ronakmalkan/puzzle/auth-service/internal/models"
	"github.com/ronakmalkan/puzzle/auth-service/internal/services"
	"github.com/ronakmalkan/puzzle/auth-service/pkg/jwt"
)

func main() {
	// Load environment variables
	if err := godotenv.Load(); err != nil {
		log.Println("No .env file found, using system environment variables")
	}

	// Load configuration
	cfg := config.LoadConfig()

	// Initialize database
	ctx := context.Background()
	db, err := config.NewDatabasePool(ctx, cfg.DatabaseURL)
	if err != nil {
		log.Fatalf("Failed to connect to database: %v", err)
	}
	defer db.Close()

	// Initialize Redis
	redisClient, err := config.NewRedisClient(cfg.RedisURL)
	if err != nil {
		log.Fatalf("Failed to connect to Redis: %v", err)
	}
	defer redisClient.Close()

	// Initialize JWT manager
	jwtManager := jwt.NewJWTManager(cfg.JWTSecret, cfg.JWTExpiry)

	// Initialize repositories
	userRepo := models.NewUserRepository(db)

	// Initialize services
	authService := services.NewAuthService(userRepo, jwtManager)

	// Initialize handlers
	authHandler := handlers.NewAuthHandler(authService, jwtManager)
	healthHandler := handlers.NewHealthHandler(db, redisClient)

	// Initialize middleware
	authMiddleware := middleware.NewAuthMiddleware(jwtManager)

	// Set up Gin router
	if cfg.Environment == "production" {
		gin.SetMode(gin.ReleaseMode)
	}

	router := gin.Default()

	// Health endpoints
	router.GET("/health", healthHandler.Health)
	router.GET("/ready", healthHandler.Ready)

	// Auth endpoints
	router.POST("/signup", authHandler.Signup)
	router.POST("/login", authHandler.Login)
	router.POST("/verify", authHandler.VerifyToken)

	// Protected endpoints
	protected := router.Group("/")
	protected.Use(authMiddleware.Authenticate())
	{
		protected.GET("/me", authHandler.GetMe)
	}

	// Start server
	log.Printf("Auth service starting on port %s", cfg.Port)
	log.Printf("Environment: %s", cfg.Environment)

	// Graceful shutdown
	srv := &gin.Engine{}
	*srv = *router

	go func() {
		if err := router.Run(":" + cfg.Port); err != nil {
			log.Fatalf("Failed to start server: %v", err)
		}
	}()

	// Wait for interrupt signal
	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit

	log.Println("Shutting down server...")

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	// Cleanup
	db.Close()
	redisClient.Close()

	log.Println("Server exited")
}
