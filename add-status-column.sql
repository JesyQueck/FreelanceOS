-- Add status column to existing services table
ALTER TABLE services ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'draft';

-- Create index for status column if it doesn't exist
CREATE INDEX IF NOT EXISTS idx_services_status ON services(status);

-- Update existing services to have default status
UPDATE services SET status = 'draft' WHERE status IS NULL;
