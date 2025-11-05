# Blog Service

## Overview
Manages public blog publishing, social features (likes, comments), search, and blog feed.

## Technology Stack
- **Runtime**: Node.js 20+ with TypeScript
- **Framework**: Express.js
- **Database**: PostgreSQL (puzzle_blog_db)
- **Cache**: Redis
- **Search**: PostgreSQL Full-Text Search
- **Message Queue**: RabbitMQ (publishes events)
- **Logging**: Pino
- **Metrics**: prom-client

## Responsibilities
- Blog publishing (convert blocks to blogs)
- Blog feed with pagination
- Full-text search
- Like/unlike functionality
- Comment system (nested comments)
- User profiles (public)
- Blog visibility control (public/private/unlisted)
- Tag management

## Port
- **Development**: 8003
- **Production**: 8003

## Database
- **Database**: `puzzle_blog_db`
- **Tables**: `blogs`, `blog_likes`, `blog_comments`

## Environment Variables
```env
PORT=8003
NODE_ENV=production
DATABASE_HOST=ronak-verse-postgres
DATABASE_PORT=5432
DATABASE_NAME=puzzle_blog_db
DATABASE_USER=postgres
DATABASE_PASSWORD=<password>
REDIS_HOST=ronak-verse-redis
REDIS_PORT=6379
RABBITMQ_HOST=ronak-verse-rabbitmq
RABBITMQ_PORT=5672
RABBITMQ_USER=admin
RABBITMQ_PASSWORD=<password>
JWT_SECRET=<secret>
```

## API Endpoints

### Blogs
- `POST /blogs` - Publish new blog from blocks
- `GET /blogs` - Get blog feed (paginated, public blogs only)
- `GET /blogs/:id` - Get single blog
- `PUT /blogs/:id` - Update blog
- `DELETE /blogs/:id` - Delete blog
- `GET /blogs/search?q=query` - Search blogs (full-text)
- `GET /blogs/user/:userId` - Get user's public blogs

### Likes
- `POST /blogs/:id/like` - Like a blog
- `DELETE /blogs/:id/like` - Unlike a blog
- `GET /blogs/:id/likes` - Get like count

### Comments
- `POST /blogs/:id/comments` - Add comment
- `GET /blogs/:id/comments` - Get comments (nested)
- `PUT /comments/:id` - Edit comment
- `DELETE /comments/:id` - Delete comment

### User Profiles
- `GET /users/:id/profile` - Get public profile
- `PUT /users/:id/profile` - Update own profile

### Metrics
- `GET /metrics` - Prometheus metrics

## Events Published (RabbitMQ)
- `blog.published` - When user publishes a blog
- `blog.liked` - When user likes a blog
- `blog.unliked` - When user unlikes a blog
- `blog.commented` - When user comments on a blog

## Caching Strategy
- **Blog feed**: 1 minute TTL, invalidate on new blog
- **Blog detail**: 5 minutes TTL, invalidate on edit
- **Like counts**: 30 seconds TTL, write-through on like/unlike
- **Comment counts**: 30 seconds TTL, write-through on comment
- **User profiles**: 30 minutes TTL, invalidate on profile update
- **Search results**: 5 minutes TTL

Cache keys:
- `blog:feed:page:{pageNum}`
- `blog:{blogId}`
- `blog:likes:{blogId}`
- `user:profile:{userId}`
- `search:{query}:{hash}`

## Search Implementation
PostgreSQL Full-Text Search with tsvector:
- Index on `search_vector` column (GIN index)
- Auto-updated trigger on content changes
- Supports English language stemming
- Typo tolerance via similarity queries

## Development
```bash
cd services/blog-service
npm install
npm run dev
```

## Docker Build
```bash
docker build -t puzzle-blog-service .
docker run -p 8003:8003 puzzle-blog-service
```
