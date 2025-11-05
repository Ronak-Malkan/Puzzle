# Auth Service

## Overview
Handles user authentication, registration, OAuth integration, and JWT token management.

## Technology Stack
- **Runtime**: Go 1.21+
- **Database**: PostgreSQL (puzzle_auth_db)
- **OAuth**: Goth library
- **JWT**: golang-jwt
- **Password Hashing**: bcrypt
- **Logging**: Logrus
- **Metrics**: Prometheus client

## Responsibilities
- User signup and login
- Password hashing and validation
- JWT token generation and validation
- OAuth integration (Google, GitHub)
- User profile management
- Token refresh mechanism

## Port
- **Development**: 8001
- **Production**: 8001

## Database
- **Database**: `puzzle_auth_db`
- **Tables**: `users`

## Environment Variables
```env
PORT=8001
DATABASE_HOST=ronak-verse-postgres
DATABASE_PORT=5432
DATABASE_NAME=puzzle_auth_db
DATABASE_USER=postgres
DATABASE_PASSWORD=<password>
REDIS_HOST=ronak-verse-redis
REDIS_PORT=6379
JWT_SECRET=<secret>
JWT_EXPIRY=24h
GOOGLE_CLIENT_ID=<google-oauth-client-id>
GOOGLE_CLIENT_SECRET=<google-oauth-secret>
GITHUB_CLIENT_ID=<github-oauth-client-id>
GITHUB_CLIENT_SECRET=<github-oauth-secret>
OAUTH_CALLBACK_URL=https://puzzle.ronakverse.net/api/auth/callback
```

## API Endpoints
- `POST /signup` - Create new user account
- `POST /login` - Authenticate user and return JWT
- `POST /refresh-token` - Refresh expired JWT
- `GET /me` - Get current user info
- `GET /oauth/google` - Initiate Google OAuth flow
- `GET /oauth/google/callback` - Google OAuth callback
- `GET /oauth/github` - Initiate GitHub OAuth flow
- `GET /oauth/github/callback` - GitHub OAuth callback
- `GET /metrics` - Prometheus metrics

## Development
```bash
cd services/auth-service
go mod init puzzle/auth-service
go mod tidy
go run main.go
```

## Docker Build
```bash
docker build -t puzzle-auth-service .
docker run -p 8001:8001 puzzle-auth-service
```

## Security
- Passwords hashed with bcrypt (cost factor: 10)
- JWT tokens with 24-hour expiry
- OAuth 2.0 for social login
- Rate limiting on login attempts
