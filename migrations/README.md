# Database Migrations

## Overview
This directory contains database migration scripts for the Puzzle application. Migrations create and manage the database schema across all microservices.

## Database Architecture
Puzzle uses a **database-per-service** pattern with logical separation:
- Single PostgreSQL instance (shared infrastructure)
- 5 separate databases (one per service)
- No direct cross-database queries
- Services communicate via APIs or events

## Databases

| Database | Service | Tables | Purpose |
|----------|---------|--------|---------|
| `puzzle_auth_db` | Auth Service | users, refresh_tokens | User authentication and OAuth |
| `puzzle_blocks_db` | Block Service | blocks, properties, table_data | Block management and pages |
| `puzzle_blog_db` | Blog Service | blogs, blog_likes, blog_comments | Public blogs and social features |
| `puzzle_notifications_db` | Notification Service | notifications, email_log | In-app and email notifications |

## Migration Files

### init.sql
Initial database setup script that creates:
- All 4 databases
- All tables with proper constraints
- Indexes for performance
- Foreign keys and cascade deletes
- Full-text search setup (for blogs)
- Triggers for auto-updating search vectors

**Idempotent**: Safe to run multiple times (uses `IF NOT EXISTS`)

## Running Migrations

### Local Development (Docker)
```bash
# Start PostgreSQL container
docker-compose -f docker-compose.dev.yml up postgres -d

# Run migration
docker exec -i puzzle-postgres psql -U postgres < migrations/init.sql

# Verify databases created
docker exec -i puzzle-postgres psql -U postgres -c "\l"
```

### Production (Ronak-Verse)
Migrations run automatically during deployment via `deploy.sh`:
```bash
# Check if databases exist, run migration if not
docker exec ronak-verse-postgres psql -U postgres -tc \
  "SELECT 1 FROM pg_database WHERE datname = 'puzzle_auth_db'" | grep -q 1 || \
  docker exec -i ronak-verse-postgres psql -U postgres < migrations/init.sql
```

### Manual Migration (Production)
```bash
# SSH into droplet
ssh root@your-droplet-ip

# Run migration
docker exec -i ronak-verse-postgres psql -U postgres < /root/puzzle-app/migrations/init.sql
```

## Database Schema

### Auth Service (puzzle_auth_db)

**users**
```sql
- id (UUID, PK)
- email (VARCHAR, UNIQUE)
- password_hash (BYTEA, nullable for OAuth users)
- first_name, last_name (VARCHAR)
- oauth_provider (VARCHAR: 'google', 'github', NULL)
- oauth_id (VARCHAR)
- avatar_url (VARCHAR)
- bio (TEXT)
- created_at, updated_at (TIMESTAMP)
```

**refresh_tokens**
```sql
- id (UUID, PK)
- user_id (UUID, FK → users)
- token_hash (VARCHAR, UNIQUE)
- expires_at (TIMESTAMP)
- created_at (TIMESTAMP)
```

### Block Service (puzzle_blocks_db)

**blocks**
```sql
- id (UUID, PK)
- user_id (UUID, soft reference)
- block_type (VARCHAR: 'page', 'text', 'heading1', etc.)
- position (INTEGER)
- parent (UUID, FK → blocks, nullable)
- properties (BOOLEAN)
- children (BOOLEAN)
- created_at, updated_at (TIMESTAMP)
```

**properties**
```sql
- id (UUID, PK)
- block_id (UUID, FK → blocks)
- property_name (VARCHAR: 'title', 'checked')
- value (TEXT)
```

**table_data**
```sql
- id (UUID, PK)
- block_id (UUID, FK → blocks)
- columns (JSONB: column definitions)
- rows (JSONB: row data)
- created_at, updated_at (TIMESTAMP)
```

### Blog Service (puzzle_blog_db)

**blogs**
```sql
- id (UUID, PK)
- user_id (UUID, soft reference)
- title (VARCHAR)
- content_blocks (JSONB: copy of blocks)
- tags (TEXT[])
- visibility (VARCHAR: 'public', 'private', 'unlisted')
- like_count, comment_count, view_count (INTEGER)
- published_at, updated_at (TIMESTAMP)
- search_vector (tsvector: auto-generated)
```

**blog_likes**
```sql
- blog_id (UUID, FK → blogs, PK)
- user_id (UUID, PK)
- created_at (TIMESTAMP)
```

**blog_comments**
```sql
- id (UUID, PK)
- blog_id (UUID, FK → blogs)
- user_id (UUID, soft reference)
- parent_comment_id (UUID, FK → blog_comments, nullable)
- content (TEXT)
- created_at, updated_at (TIMESTAMP)
```

### Notification Service (puzzle_notifications_db)

**notifications**
```sql
- id (UUID, PK)
- user_id (UUID, soft reference)
- type (VARCHAR: 'blog_liked', 'blog_commented', etc.)
- title, body (VARCHAR, TEXT)
- link (VARCHAR: deep link)
- read (BOOLEAN)
- created_at (TIMESTAMP)
```

**email_log**
```sql
- id (UUID, PK)
- recipient_email (VARCHAR)
- recipient_user_id (UUID, nullable)
- subject, body (VARCHAR, TEXT)
- template_name (VARCHAR)
- sent_at (TIMESTAMP)
- status (VARCHAR: 'sent', 'failed', 'bounced')
- error_message (TEXT)
- provider_message_id (VARCHAR)
```

## Key Design Decisions

### Soft References (No Foreign Keys Across Services)
User IDs in non-auth services are stored as UUIDs without foreign key constraints. This allows:
- Service independence (can deploy/migrate separately)
- No cascading dependencies across services
- Better fault isolation

### JSONB for Flexible Data
- `table_data.columns/rows`: Dynamic table structure
- `blogs.content_blocks`: Snapshot of block content (not reference)

### Full-Text Search
Blogs table has auto-updating `search_vector` column:
- Trigger updates on INSERT/UPDATE
- Weighted search: Title (A), Content (B), Tags (C)
- GIN index for fast queries

### Cascade Deletes
- User deletes account → All their blocks deleted
- Block deleted → Properties/table_data deleted
- Blog deleted → Likes and comments deleted
- Parent block deleted → Child blocks deleted

## Troubleshooting

### Check if databases exist
```bash
docker exec ronak-verse-postgres psql -U postgres -c "\l" | grep puzzle
```

### Connect to specific database
```bash
docker exec -it ronak-verse-postgres psql -U postgres -d puzzle_auth_db
```

### Drop all databases (DANGER - only for development reset)
```bash
docker exec ronak-verse-postgres psql -U postgres -c "DROP DATABASE IF EXISTS puzzle_auth_db;"
docker exec ronak-verse-postgres psql -U postgres -c "DROP DATABASE IF EXISTS puzzle_blocks_db;"
docker exec ronak-verse-postgres psql -U postgres -c "DROP DATABASE IF EXISTS puzzle_blog_db;"
docker exec ronak-verse-postgres psql -U postgres -c "DROP DATABASE IF EXISTS puzzle_notifications_db;"
```

### Check table counts
```bash
# Auth DB
docker exec ronak-verse-postgres psql -U postgres -d puzzle_auth_db -c "SELECT COUNT(*) FROM users;"

# Blocks DB
docker exec ronak-verse-postgres psql -U postgres -d puzzle_blocks_db -c "SELECT COUNT(*) FROM blocks;"

# Blog DB
docker exec ronak-verse-postgres psql -U postgres -d puzzle_blog_db -c "SELECT COUNT(*) FROM blogs;"

# Notifications DB
docker exec ronak-verse-postgres psql -U postgres -d puzzle_notifications_db -c "SELECT COUNT(*) FROM notifications;"
```

## Future Migrations
When adding new features:
1. Create new migration file: `001_add_feature.sql`
2. Add rollback file: `001_rollback.sql`
3. Update this README with changes
4. Consider using migration tool (e.g., Flyway, Liquibase) for version tracking
