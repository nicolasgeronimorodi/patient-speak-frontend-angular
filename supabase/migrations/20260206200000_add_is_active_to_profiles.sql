-- Migration: Add is_active column to profiles table
-- Purpose: Enable soft-delete functionality for user profiles
-- Date: 2026-02-06

-- Add is_active column with default true
ALTER TABLE profiles ADD COLUMN is_active BOOLEAN DEFAULT true NOT NULL;

-- Update existing records to be active (for safety, though default should handle this)
UPDATE profiles SET is_active = true WHERE is_active IS NULL;

-- Create index for better query performance when filtering by is_active
CREATE INDEX idx_profiles_is_active ON profiles(is_active);

-- Add comment to document the column
COMMENT ON COLUMN profiles.is_active IS 'Indicates if the user profile is active. Inactive users cannot access the system.';
