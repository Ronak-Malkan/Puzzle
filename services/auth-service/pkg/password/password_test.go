package password

import (
	"testing"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func TestHashPassword(t *testing.T) {
	plainPassword := "MySecurePass123!"

	hash, err := HashPassword(plainPassword)

	require.NoError(t, err, "Should hash password without error")
	assert.NotEmpty(t, hash, "Hash should not be empty")
	assert.NotEqual(t, plainPassword, hash, "Hash should not equal plain password")
	assert.Greater(t, len(hash), 30, "Hash should be substantial length")
}

func TestComparePassword_CorrectPassword(t *testing.T) {
	plainPassword := "MySecurePass123!"

	hash, err := HashPassword(plainPassword)
	require.NoError(t, err)

	match, err := ComparePassword(plainPassword, hash)

	require.NoError(t, err, "Should compare without error")
	assert.True(t, match, "Correct password should match hash")
}

func TestComparePassword_IncorrectPassword(t *testing.T) {
	correctPassword := "MySecurePass123!"
	wrongPassword := "WrongPassword456!"

	hash, err := HashPassword(correctPassword)
	require.NoError(t, err)

	match, err := ComparePassword(wrongPassword, hash)

	require.NoError(t, err, "Should compare without error")
	assert.False(t, match, "Incorrect password should not match hash")
}

func TestValidatePasswordStrength_ValidPasswords(t *testing.T) {
	validPasswords := []string{
		"ValidPass1!",
		"Str0ng@Password",
		"MyP@ssw0rd123",
		"Test#1234Password",
	}

	for _, password := range validPasswords {
		t.Run(password, func(t *testing.T) {
			assert.True(t, ValidatePasswordStrength(password),
				"Valid password should pass validation: %s", password)
		})
	}
}

func TestValidatePasswordStrength_InvalidPasswords(t *testing.T) {
	testCases := []struct {
		name     string
		password string
		reason   string
	}{
		{
			name:     "no_uppercase",
			password: "nouppercas3!",
			reason:   "missing uppercase letter",
		},
		{
			name:     "no_lowercase",
			password: "NOLOWERCASE3!",
			reason:   "missing lowercase letter",
		},
		{
			name:     "no_digit",
			password: "NoDigitPass!",
			reason:   "missing digit",
		},
		{
			name:     "no_special",
			password: "NoSpecial123",
			reason:   "missing special character",
		},
		{
			name:     "too_short",
			password: "Sh0rt!",
			reason:   "less than 8 characters",
		},
		{
			name:     "empty",
			password: "",
			reason:   "empty password",
		},
	}

	for _, tc := range testCases {
		t.Run(tc.name, func(t *testing.T) {
			assert.False(t, ValidatePasswordStrength(tc.password),
				"Invalid password should fail validation: %s (%s)", tc.password, tc.reason)
		})
	}
}

func TestHashPassword_DifferentHashes(t *testing.T) {
	password := "SamePassword123!"

	hash1, err1 := HashPassword(password)
	hash2, err2 := HashPassword(password)

	require.NoError(t, err1)
	require.NoError(t, err2)
	assert.NotEqual(t, hash1, hash2, "Same password should produce different hashes (due to salt)")
}
