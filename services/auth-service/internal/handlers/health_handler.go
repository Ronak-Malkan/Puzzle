package handlers

import (
	"context"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/redis/go-redis/v9"
)

type HealthHandler struct {
	db    *pgxpool.Pool
	redis *redis.Client
}

func NewHealthHandler(db *pgxpool.Pool, redis *redis.Client) *HealthHandler {
	return &HealthHandler{
		db:    db,
		redis: redis,
	}
}

type HealthResponse struct {
	Service   string                 `json:"service"`
	Status    string                 `json:"status"`
	Timestamp string                 `json:"timestamp"`
	Checks    map[string]string      `json:"checks"`
}

func (h *HealthHandler) Health(c *gin.Context) {
	health := HealthResponse{
		Service:   "auth-service",
		Status:    "up",
		Timestamp: time.Now().Format(time.RFC3339),
		Checks: map[string]string{
			"database": "unknown",
			"redis":    "unknown",
		},
	}

	ctx, cancel := context.WithTimeout(c.Request.Context(), 5*time.Second)
	defer cancel()

	// Check database
	if err := h.db.Ping(ctx); err != nil {
		health.Checks["database"] = "unhealthy"
		health.Status = "degraded"
	} else {
		health.Checks["database"] = "healthy"
	}

	// Check Redis
	if err := h.redis.Ping(ctx).Err(); err != nil {
		health.Checks["redis"] = "unhealthy"
		health.Status = "degraded"
	} else {
		health.Checks["redis"] = "healthy"
	}

	statusCode := http.StatusOK
	if health.Status != "up" {
		statusCode = http.StatusServiceUnavailable
	}

	c.JSON(statusCode, health)
}

func (h *HealthHandler) Ready(c *gin.Context) {
	ctx, cancel := context.WithTimeout(c.Request.Context(), 5*time.Second)
	defer cancel()

	// Check database
	if err := h.db.Ping(ctx); err != nil {
		c.JSON(http.StatusServiceUnavailable, gin.H{"ready": false})
		return
	}

	// Check Redis
	if err := h.redis.Ping(ctx).Err(); err != nil {
		c.JSON(http.StatusServiceUnavailable, gin.H{"ready": false})
		return
	}

	c.JSON(http.StatusOK, gin.H{"ready": true})
}
