# Block Service

## Overview
Manages all block-related operations including CRUD, pages, tables, and drag-and-drop positioning.

## Technology Stack
- **Runtime**: Node.js 20+ with TypeScript
- **Framework**: Express.js
- **Database**: PostgreSQL (puzzle_blocks_db)
- **Cache**: Redis
- **Logging**: Pino
- **Metrics**: prom-client

## Responsibilities
- Block CRUD operations
- Page management
- Table block functionality
- Block positioning and reordering
- Hierarchical block relationships (parent-child)
- Block properties management

## Port
- **Development**: 8002
- **Production**: 8002

## Database
- **Database**: `puzzle_blocks_db`
- **Tables**: `blocks`, `properties`, `table_data`

## Environment Variables
```env
PORT=8002
NODE_ENV=production
DATABASE_HOST=ronak-verse-postgres
DATABASE_PORT=5432
DATABASE_NAME=puzzle_blocks_db
DATABASE_USER=postgres
DATABASE_PASSWORD=<password>
REDIS_HOST=ronak-verse-redis
REDIS_PORT=6379
JWT_SECRET=<secret>
```

## API Endpoints
- `POST /blocks` - Create new block
- `GET /blocks/:pageId` - Get all blocks for a page
- `GET /blocks/:id` - Get single block
- `PUT /blocks/:id` - Update block
- `DELETE /blocks/:id` - Delete block (cascades to children)
- `PATCH /blocks/reorder` - Batch update block positions (drag-drop)
- `GET /pages` - Get all pages for authenticated user
- `POST /pages` - Create new page
- `PUT /pages/:id` - Update page
- `DELETE /pages/:id` - Delete page
- `GET /tables/:blockId` - Get table data
- `PUT /tables/:blockId` - Update table data
- `GET /metrics` - Prometheus metrics

## Block Types Supported
- `page` - Top-level container
- `text` - Plain text paragraph
- `heading1`, `heading2`, `heading3` - Headings
- `ul` - Unordered list item
- `checklist` - Todo item with checkbox
- `table` - Table with dynamic rows/columns

## Caching Strategy
- **User pages list**: 5 minutes TTL, invalidate on create/delete
- **Block content**: 2 minutes TTL, invalidate on edit
- Cache keys: `user:pages:{userId}`, `blocks:page:{pageId}`

## Development
```bash
cd services/block-service
npm install
npm run dev
```

## Docker Build
```bash
docker build -t puzzle-block-service .
docker run -p 8002:8002 puzzle-block-service
```
