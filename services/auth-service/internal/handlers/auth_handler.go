package handlers

import (
	"fmt"
	"log"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/ronakmalkan/puzzle/auth-service/internal/services"
	"github.com/ronakmalkan/puzzle/auth-service/pkg/jwt"
)

type AuthHandler struct {
	authService *services.AuthService
	jwtManager  *jwt.JWTManager
}

func NewAuthHandler(authService *services.AuthService, jwtManager *jwt.JWTManager) *AuthHandler {
	return &AuthHandler{
		authService: authService,
		jwtManager:  jwtManager,
	}
}

func (h *AuthHandler) Signup(c *gin.Context) {
	var input services.SignupInput

	if err := c.ShouldBindJSON(&input); err != nil {
		log.Printf("Signup binding error: %v", err)
		c.JSON(http.StatusBadRequest, gin.H{
			"error": fmt.Sprintf("Invalid input: %v", err),
		})
		return
	}

	response, err := h.authService.Signup(c.Request.Context(), input)
	if err != nil {
		log.Printf("Signup error: %v", err)
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, response)
}

func (h *AuthHandler) Login(c *gin.Context) {
	var input services.LoginInput

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Missing required fields: email, password",
		})
		return
	}

	response, err := h.authService.Login(c.Request.Context(), input)
	if err != nil {
		log.Printf("Login error: %v", err)
		c.JSON(http.StatusUnauthorized, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, response)
}

func (h *AuthHandler) GetMe(c *gin.Context) {
	userID, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	userInfo, err := h.authService.GetUserInfo(c.Request.Context(), userID.(int64))
	if err != nil {
		log.Printf("Get user info error: %v", err)
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, userInfo)
}

func (h *AuthHandler) VerifyToken(c *gin.Context) {
	authHeader := c.GetHeader("Authorization")
	if authHeader == "" {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Token required"})
		return
	}

	// Extract token from "Bearer <token>"
	var token string
	if len(authHeader) > 7 && authHeader[:7] == "Bearer " {
		token = authHeader[7:]
	} else {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid authorization header format"})
		return
	}

	payload, err := h.jwtManager.VerifyToken(token)
	if err != nil {
		log.Printf("Token verification failed: %v", err)
		c.JSON(http.StatusUnauthorized, gin.H{
			"valid": false,
			"error": "Invalid token",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"valid": true,
		"user":  payload,
	})
}
