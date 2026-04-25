-- Current canonical schema for fresh database bootstrap.
-- For historical billing migration notes, see migrations/README.md.

DROP TABLE IF EXISTS users;
CREATE TABLE users (
  uid TEXT PRIMARY KEY,
  email TEXT,
  display_name TEXT,
  level INTEGER DEFAULT 1,
  xp INTEGER DEFAULT 0,
  gro INTEGER DEFAULT 0,
  star INTEGER DEFAULT 0,
  current_land TEXT DEFAULT 'default_ground',
  inventory TEXT DEFAULT '[]',
  game_data TEXT,
  entitlement_status TEXT DEFAULT 'inactive',
  entitlement_kind TEXT,
  entitlement_plan TEXT,
  entitlement_end INTEGER DEFAULT 0,
  billing_provider TEXT,
  billing_reference_id TEXT,
  billing_reference_type TEXT,
  created_at INTEGER,
  last_synced_at INTEGER
);

CREATE TABLE daily_routine_claims (
  uid TEXT NOT NULL,
  date_key TEXT NOT NULL,
  claimed_at INTEGER NOT NULL,
  PRIMARY KEY (uid, date_key)
);

CREATE TABLE api_rate_limits (
  key TEXT PRIMARY KEY,
  count INTEGER NOT NULL DEFAULT 0,
  window_start INTEGER NOT NULL,
  last_seen INTEGER NOT NULL,
  blocked_until INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE xsolla_webhook_events (
  event_key TEXT PRIMARY KEY,
  notification_type TEXT NOT NULL,
  uid TEXT,
  product_id TEXT,
  xsolla_transaction_id INTEGER,
  xsolla_subscription_id INTEGER,
  processing_status TEXT NOT NULL DEFAULT 'processing',
  processed_at INTEGER NOT NULL
);
