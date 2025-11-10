package jwt

import (
	"testing"
	"time"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func TestGenerateToken(t *testing.T) {
	secret := "test-secret"
	expiry := "1h"

	manager := NewJWTManager(secret, expiry)

	payload := TokenPayload{
		ID:    1,
		Email: "test@example.com",
	}

	token, err := manager.GenerateToken(payload)

	require.NoError(t, err, "Should generate token without error")
	assert.NotEmpty(t, token, "Token should not be empty")
	assert.Greater(t, len(token), 20, "Token should be a substantial string")
}

func TestVerifyToken_ValidToken(t *testing.T) {
	secret := "test-secret"
	expiry := "1h"

	manager := NewJWTManager(secret, expiry)

	originalPayload := TokenPayload{
		ID:    42,
		Email: "user@example.com",
	}

	token, err := manager.GenerateToken(originalPayload)
	require.NoError(t, err)

	verifiedPayload, err := manager.VerifyToken(token)

	require.NoError(t, err, "Should verify valid token")
	assert.Equal(t, originalPayload.ID, verifiedPayload.ID)
	assert.Equal(t, originalPayload.Email, verifiedPayload.Email)
}

func TestVerifyToken_InvalidToken(t *testing.T) {
	secret := "test-secret"
	expiry := "1h"

	manager := NewJWTManager(secret, expiry)

	invalidToken := "invalid.jwt.token"

	_, err := manager.VerifyToken(invalidToken)

	assert.Error(t, err, "Should return error for invalid token")
}

func TestVerifyToken_ExpiredToken(t *testing.T) {
	secret := "test-secret"
	expiry := "1ms" // Very short expiry

	manager := NewJWTManager(secret, expiry)

	payload := TokenPayload{
		ID:    1,
		Email: "test@example.com",
	}

	token, err := manager.GenerateToken(payload)
	require.NoError(t, err)

	// Wait for token to expire
	time.Sleep(10 * time.Millisecond)

	_, err = manager.VerifyToken(token)

	assert.Error(t, err, "Should return error for expired token")
}

func TestVerifyToken_WrongSecret(t *testing.T) {
	manager1 := NewJWTManager("secret1", "1h")
	manager2 := NewJWTManager("secret2", "1h")

	payload := TokenPayload{
		ID:    1,
		Email: "test@example.com",
	}

	token, err := manager1.GenerateToken(payload)
	require.NoError(t, err)

	_, err = manager2.VerifyToken(token)

	assert.Error(t, err, "Should return error when verifying with wrong secret")
}
