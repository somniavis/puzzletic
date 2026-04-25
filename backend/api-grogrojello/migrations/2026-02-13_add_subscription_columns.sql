-- Historical migration.
-- Adds legacy pre-entitlement subscription columns to an existing users table.
-- Do not treat this file alone as a fresh bootstrap step for a brand-new database.

ALTER TABLE users ADD COLUMN is_premium INTEGER DEFAULT 0;
ALTER TABLE users ADD COLUMN subscription_end INTEGER DEFAULT 0;
ALTER TABLE users ADD COLUMN subscription_plan TEXT;
