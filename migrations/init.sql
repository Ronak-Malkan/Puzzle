-- ============================================================================
-- Puzzle Database Initialization Script
-- ============================================================================
-- This script creates all databases and tables for the Puzzle application.
-- Run once during initial deployment. Safe to run multiple times (idempotent).
-- ============================================================================

-- ============================================================================
-- 1. AUTH SERVICE DATABASE
-- ============================================================================

-- Create database if not exists
SELECT 'CREATE DATABASE puzzle_auth_db'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'puzzle_auth_db')\gexec

-- Connect to auth database
\c puzzle_auth_db;

-- Create users table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(320) UNIQUE NOT NULL,
    password_hash BYTEA,  -- NULL if OAuth-only user
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    oauth_provider VARCHAR(50),  -- 'google', 'github', NULL
    oauth_id VARCHAR(255),  -- Provider's user ID
    avatar_url VARCHAR(500),  -- Profile picture URL
    bio TEXT,  -- User bio for public profile
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_oauth ON users(oauth_provider, oauth_id);

-- Create refresh tokens table (for JWT refresh mechanism)
CREATE TABLE IF NOT EXISTS refresh_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token_hash VARCHAR(255) UNIQUE NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_refresh_tokens_user ON refresh_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_hash ON refresh_tokens(token_hash);

-- ============================================================================
-- 2. BLOCK SERVICE DATABASE
-- ============================================================================

-- Create database if not exists
\c postgres;
SELECT 'CREATE DATABASE puzzle_blocks_db'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'puzzle_blocks_db')\gexec

-- Connect to blocks database
\c puzzle_blocks_db;

-- Create blocks table
CREATE TABLE IF NOT EXISTS blocks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,  -- Soft reference to auth_db.users
    block_type VARCHAR(50) NOT NULL,  -- 'page', 'text', 'heading1', 'heading2', 'heading3', 'ul', 'checklist', 'table'
    position INTEGER NOT NULL DEFAULT 0,
    parent UUID REFERENCES blocks(id) ON DELETE CASCADE,  -- Parent block (NULL for pages)
    properties BOOLEAN DEFAULT FALSE,  -- Has properties?
    children BOOLEAN DEFAULT FALSE,  -- Has children?
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_blocks_user ON blocks(user_id);
CREATE INDEX IF NOT EXISTS idx_blocks_parent ON blocks(parent);
CREATE INDEX IF NOT EXISTS idx_blocks_type ON blocks(block_type);
CREATE INDEX IF NOT EXISTS idx_blocks_position ON blocks(position);

-- Create properties table
CREATE TABLE IF NOT EXISTS properties (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    block_id UUID NOT NULL REFERENCES blocks(id) ON DELETE CASCADE,
    property_name VARCHAR(100) NOT NULL,  -- 'title', 'checked', etc.
    value TEXT
);

CREATE INDEX IF NOT EXISTS idx_properties_block ON properties(block_id);

-- Create table_data table (for table blocks)
CREATE TABLE IF NOT EXISTS table_data (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    block_id UUID NOT NULL REFERENCES blocks(id) ON DELETE CASCADE,
    columns JSONB NOT NULL,  -- [{"id": "col1", "name": "Column 1", "type": "text", "width": 200}]
    rows JSONB NOT NULL,  -- [{"id": "row1", "cells": {"col1": "value"}}]
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_table_data_block ON table_data(block_id);

-- ============================================================================
-- 3. BLOG SERVICE DATABASE
-- ============================================================================

-- Create database if not exists
\c postgres;
SELECT 'CREATE DATABASE puzzle_blog_db'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'puzzle_blog_db')\gexec

-- Connect to blog database
\c puzzle_blog_db;

-- Create blogs table
CREATE TABLE IF NOT EXISTS blogs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,  -- Soft reference to auth_db.users
    title VARCHAR(500) NOT NULL,
    content_blocks JSONB NOT NULL,  -- Copy of blocks from block service (not reference)
    tags TEXT[],  -- Array of tags
    visibility VARCHAR(20) DEFAULT 'public',  -- 'public', 'private', 'unlisted'
    like_count INTEGER DEFAULT 0,
    comment_count INTEGER DEFAULT 0,
    view_count INTEGER DEFAULT 0,
    published_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    search_vector tsvector  -- Full-text search column
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_blogs_user ON blogs(user_id);
CREATE INDEX IF NOT EXISTS idx_blogs_published ON blogs(published_at DESC);
CREATE INDEX IF NOT EXISTS idx_blogs_visibility ON blogs(visibility);
CREATE INDEX IF NOT EXISTS idx_blogs_tags ON blogs USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_blogs_search ON blogs USING GIN(search_vector);

-- Create trigger to auto-update search_vector
CREATE OR REPLACE FUNCTION blogs_search_trigger() RETURNS trigger AS $$
BEGIN
    NEW.search_vector :=
        setweight(to_tsvector('english', coalesce(NEW.title, '')), 'A') ||
        setweight(to_tsvector('english', coalesce(NEW.content_blocks::text, '')), 'B') ||
        setweight(to_tsvector('english', coalesce(array_to_string(NEW.tags, ' '), '')), 'C');
    RETURN NEW;
END
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS blogs_search_update ON blogs;
CREATE TRIGGER blogs_search_update
    BEFORE INSERT OR UPDATE ON blogs
    FOR EACH ROW EXECUTE FUNCTION blogs_search_trigger();

-- Create blog_likes table
CREATE TABLE IF NOT EXISTS blog_likes (
    blog_id UUID NOT NULL REFERENCES blogs(id) ON DELETE CASCADE,
    user_id UUID NOT NULL,  -- Soft reference
    created_at TIMESTAMP DEFAULT NOW(),
    PRIMARY KEY (blog_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_blog_likes_blog ON blog_likes(blog_id);
CREATE INDEX IF NOT EXISTS idx_blog_likes_user ON blog_likes(user_id);

-- Create blog_comments table
CREATE TABLE IF NOT EXISTS blog_comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    blog_id UUID NOT NULL REFERENCES blogs(id) ON DELETE CASCADE,
    user_id UUID NOT NULL,  -- Soft reference
    parent_comment_id UUID REFERENCES blog_comments(id) ON DELETE CASCADE,  -- For nested comments
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_blog_comments_blog ON blog_comments(blog_id);
CREATE INDEX IF NOT EXISTS idx_blog_comments_user ON blog_comments(user_id);
CREATE INDEX IF NOT EXISTS idx_blog_comments_parent ON blog_comments(parent_comment_id);

-- ============================================================================
-- 4. NOTIFICATION SERVICE DATABASE
-- ============================================================================

-- Create database if not exists
\c postgres;
SELECT 'CREATE DATABASE puzzle_notifications_db'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'puzzle_notifications_db')\gexec

-- Connect to notifications database
\c puzzle_notifications_db;

-- Create notifications table (in-app notifications)
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,  -- Soft reference
    type VARCHAR(50) NOT NULL,  -- 'blog_liked', 'blog_commented', 'new_follower', etc.
    title VARCHAR(255) NOT NULL,
    body TEXT NOT NULL,
    link VARCHAR(500),  -- Deep link to relevant content
    read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(user_id, read);
CREATE INDEX IF NOT EXISTS idx_notifications_created ON notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications(type);

-- Create email_log table (audit trail for sent emails)
CREATE TABLE IF NOT EXISTS email_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    recipient_email VARCHAR(320) NOT NULL,
    recipient_user_id UUID,  -- Soft reference (NULL if system email)
    subject VARCHAR(500) NOT NULL,
    body TEXT,
    template_name VARCHAR(100),  -- 'welcome', 'blog_liked', etc.
    sent_at TIMESTAMP DEFAULT NOW(),
    status VARCHAR(20) DEFAULT 'sent',  -- 'sent', 'failed', 'bounced'
    error_message TEXT,
    provider_message_id VARCHAR(255)  -- Brevo message ID for tracking
);

CREATE INDEX IF NOT EXISTS idx_email_log_recipient ON email_log(recipient_email);
CREATE INDEX IF NOT EXISTS idx_email_log_user ON email_log(recipient_user_id);
CREATE INDEX IF NOT EXISTS idx_email_log_status ON email_log(status);
CREATE INDEX IF NOT EXISTS idx_email_log_sent ON email_log(sent_at DESC);

-- ============================================================================
-- 5. SEED DATA (Optional - for development/testing)
-- ============================================================================

-- Note: Uncomment below to create test users in development
-- \c puzzle_auth_db;
-- INSERT INTO users (email, first_name, last_name, password_hash) VALUES
--     ('test@example.com', 'Test', 'User', decode('test_hash', 'escape'))
-- ON CONFLICT (email) DO NOTHING;

-- ============================================================================
-- COMPLETION MESSAGE
-- ============================================================================

\c postgres;
SELECT 'Database initialization complete!' AS status;
SELECT datname AS database FROM pg_database WHERE datname LIKE 'puzzle_%' ORDER BY datname;
