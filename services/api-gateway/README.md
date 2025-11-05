# API Gateway Service

## Overview
Central entry point for all client requests. Handles authentication, routing, rate limiting, and request logging.

## Technology Stack
- **Runtime**: Node.js 20+
- **Framework**: Express.js
- **Proxy**: http-proxy-middleware
- **Logging**: Pino
- **Metrics**: prom-client

## Responsibilities
- JWT token verification
- Request routing to microservices
- Rate limiting (Redis-backed)
- CORS handling
- Request/response logging
- Metrics collection

## Port
- **Development**: 8080
- **Production**: 8080

## Dependencies
- Redis (for rate limiting, session cache)
- Auth Service (for token validation if needed)

## Environment Variables
```env
PORT=8080
NODE_ENV=production
REDIS_HOST=ronak-verse-redis
REDIS_PORT=6379
JWT_SECRET=<secret>
AUTH_SERVICE_URL=http://puzzle-auth-service:8001
BLOCK_SERVICE_URL=http://puzzle-block-service:8002
BLOG_SERVICE_URL=http://puzzle-blog-service:8003
```

## API Routes
- `/api/auth/*` → Auth Service
- `/api/blocks/*` → Block Service
- `/api/blogs/*` → Blog Service
- `/api/notifications/*` → Notification Service

## Development
```bash
cd services/api-gateway
npm install
npm run dev
```

## Docker Build
```bash
docker build -t puzzle-api-gateway .
docker run -p 8080:8080 puzzle-api-gateway
```
