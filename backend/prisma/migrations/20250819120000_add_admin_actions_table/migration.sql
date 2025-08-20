-- Migration: Add AdminAction Table
-- This migration creates the missing AdminAction table for admin audit trails
-- Created: 2025-08-19 12:00:00

-- Create admin_actions table if it doesn't exist
CREATE TABLE IF NOT EXISTS "admin_actions" (
    "id" TEXT PRIMARY KEY,
    "adminId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "targetType" TEXT NOT NULL,
    "targetId" TEXT NOT NULL,
    "details" TEXT,
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "admin_actions_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "users"("id") ON DELETE CASCADE
);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS "idx_admin_actions_admin_id" ON "admin_actions"("adminId");
CREATE INDEX IF NOT EXISTS "idx_admin_actions_created_at" ON "admin_actions"("createdAt");
CREATE INDEX IF NOT EXISTS "idx_admin_actions_action" ON "admin_actions"("action");
CREATE INDEX IF NOT EXISTS "idx_admin_actions_target" ON "admin_actions"("targetType", "targetId");
