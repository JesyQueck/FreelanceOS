-- Add username field to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS username TEXT UNIQUE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS slug TEXT UNIQUE;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_slug ON users(slug);

-- Function to generate unique slug from display_name
CREATE OR REPLACE FUNCTION generate_slug(display_name TEXT)
RETURNS TEXT AS $$
BEGIN
  RETURN lower(regexp_replace(display_name, '[^a-zA-Z0-9]', '-', 'g'));
END;
$$ LANGUAGE plpgsql;
