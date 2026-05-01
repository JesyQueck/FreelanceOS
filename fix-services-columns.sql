-- Add missing columns to existing services table
ALTER TABLE services ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE services ADD COLUMN IF NOT EXISTS price TEXT;
ALTER TABLE services ADD COLUMN IF NOT EXISTS timeline TEXT;
ALTER TABLE services ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'draft';
ALTER TABLE services ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Create indexes for the new columns
CREATE INDEX IF NOT EXISTS idx_services_status ON services(status);

-- Update existing services to have default values
UPDATE services SET status = 'draft' WHERE status IS NULL;
UPDATE services SET updated_at = NOW() WHERE updated_at IS NULL;
