-- Add subscription columns required by backend/api-grogrojello/src/index.js
-- Safe to run once per database.

ALTER TABLE users ADD COLUMN is_premium INTEGER DEFAULT 0;
ALTER TABLE users ADD COLUMN subscription_end INTEGER DEFAULT 0;
ALTER TABLE users ADD COLUMN subscription_plan TEXT;
