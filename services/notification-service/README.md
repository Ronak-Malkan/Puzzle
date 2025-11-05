# Notification Service

## Overview
Handles all notification delivery including email notifications, in-app notifications, and future push notifications. Event-driven architecture consuming messages from RabbitMQ.

## Technology Stack
- **Runtime**: Node.js 20+ with TypeScript
- **Framework**: Express.js
- **Database**: PostgreSQL (puzzle_notifications_db)
- **Message Queue**: RabbitMQ (consumes events)
- **Email Provider**: Brevo (SendinBlue)
- **Logging**: Pino
- **Metrics**: prom-client

## Responsibilities
- Email notification delivery
- In-app notification storage
- Event consumption from RabbitMQ
- Email templating and rendering
- Notification preferences management
- Delivery retry logic with dead-letter queue

## Port
- **Development**: 8004
- **Production**: 8004

## Database
- **Database**: `puzzle_notifications_db`
- **Tables**: `notifications`, `email_log`

## Environment Variables
```env
PORT=8004
NODE_ENV=production
DATABASE_HOST=ronak-verse-postgres
DATABASE_PORT=5432
DATABASE_NAME=puzzle_notifications_db
DATABASE_USER=postgres
DATABASE_PASSWORD=<password>
RABBITMQ_HOST=ronak-verse-rabbitmq
RABBITMQ_PORT=5672
RABBITMQ_USER=admin
RABBITMQ_PASSWORD=<password>
BREVO_API_KEY=<brevo-api-key>
BREVO_SENDER_EMAIL=noreply@puzzle.ronakverse.net
BREVO_SENDER_NAME=Puzzle
FRONTEND_URL=https://puzzle.ronakverse.net
```

## API Endpoints

### In-App Notifications
- `GET /notifications` - Get user's notifications (paginated)
- `GET /notifications/unread-count` - Get unread notification count
- `PATCH /notifications/:id/read` - Mark notification as read
- `PATCH /notifications/mark-all-read` - Mark all as read
- `DELETE /notifications/:id` - Delete notification

### Email History
- `GET /emails/history` - Get email delivery history (admin only)
- `GET /emails/:id` - Get email details

### Metrics
- `GET /metrics` - Prometheus metrics

## Events Consumed (RabbitMQ)

### Queue: `notification.queue`
Subscribed to exchanges:
- `user.events` (topic: `user.created`)
- `blog.events` (topic: `blog.*`)

### Event Handlers

**user.created**
```json
{
  "userId": "uuid",
  "email": "user@example.com",
  "firstName": "John"
}
```
Action: Send welcome email

**blog.published**
```json
{
  "blogId": "uuid",
  "authorId": "uuid",
  "title": "Blog Title"
}
```
Action: Notify followers (future feature)

**blog.liked**
```json
{
  "blogId": "uuid",
  "likerId": "uuid",
  "authorId": "uuid"
}
```
Action: Send email to blog author, create in-app notification

**blog.commented**
```json
{
  "blogId": "uuid",
  "commenterId": "uuid",
  "authorId": "uuid",
  "commentSnippet": "Great post!"
}
```
Action: Send email to blog author and mentioned users, create in-app notification

## Email Templates

### Welcome Email
- Subject: "Welcome to Puzzle!"
- Content: Getting started guide, feature highlights

### Blog Liked Notification
- Subject: "Someone liked your blog!"
- Content: Liker name, blog title, link to blog

### Blog Commented Notification
- Subject: "New comment on your blog"
- Content: Commenter name, comment snippet, link to blog

## Retry Logic
- Failed email delivery → Dead Letter Queue
- Retry 3 times with exponential backoff (1m, 5m, 15m)
- After 3 failures → Log error, alert admin

## Metrics Tracked
- `notification_email_sent_total` - Counter of sent emails
- `notification_email_failed_total` - Counter of failed emails
- `notification_created_total` - Counter of in-app notifications
- `notification_processing_duration_ms` - Histogram of processing time

## Development
```bash
cd services/notification-service
npm install
npm run dev
```

## Docker Build
```bash
docker build -t puzzle-notification-service .
docker run -p 8004:8004 puzzle-notification-service
```

## Testing Locally
Use RabbitMQ Management UI (http://localhost:15672) to publish test messages:
```json
// Exchange: blog.events
// Routing Key: blog.liked
{
  "blogId": "123",
  "likerId": "456",
  "authorId": "789"
}
```
