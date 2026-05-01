-- Add missing columns to existing users table
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS display_name TEXT;

ALTER TABLE users 
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Update existing records to set display_name from email (for existing users)
UPDATE users 
SET display_name = SPLIT_PART(email, '@', 1) 
WHERE display_name IS NULL AND name IS NULL;

-- Or if you want to set display_name from the existing name column
-- UPDATE users 
-- SET display_name = name 
-- WHERE display_name IS NULL AND name IS NOT NULL;
