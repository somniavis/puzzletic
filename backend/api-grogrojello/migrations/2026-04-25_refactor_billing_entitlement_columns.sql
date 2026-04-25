PRAGMA foreign_keys=OFF;

CREATE TABLE users__new (
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

INSERT INTO users__new (
  uid,
  email,
  display_name,
  level,
  xp,
  gro,
  star,
  current_land,
  inventory,
  game_data,
  entitlement_status,
  entitlement_kind,
  entitlement_plan,
  entitlement_end,
  billing_provider,
  billing_reference_id,
  billing_reference_type,
  created_at,
  last_synced_at
)
SELECT
  uid,
  email,
  display_name,
  level,
  xp,
  gro,
  star,
  current_land,
  inventory,
  game_data,
  CASE
    WHEN subscription_end > 0 AND subscription_end > strftime('%s', 'now') * 1000 THEN 'active'
    ELSE 'inactive'
  END,
  CASE
    WHEN subscription_plan LIKE 'subscription_%' THEN 'subscription'
    WHEN subscription_plan LIKE 'duration_%' THEN 'duration'
    ELSE NULL
  END,
  CASE
    WHEN subscription_plan LIKE 'subscription_%' OR subscription_plan LIKE 'duration_%' THEN subscription_plan
    ELSE NULL
  END,
  COALESCE(subscription_end, 0),
  CASE
    WHEN xsolla_subscription_id IS NOT NULL OR xsolla_transaction_id IS NOT NULL THEN 'xsolla'
    ELSE NULL
  END,
  CASE
    WHEN xsolla_subscription_id IS NOT NULL THEN CAST(xsolla_subscription_id AS TEXT)
    WHEN xsolla_transaction_id IS NOT NULL THEN CAST(xsolla_transaction_id AS TEXT)
    ELSE NULL
  END,
  CASE
    WHEN xsolla_subscription_id IS NOT NULL THEN 'subscription_id'
    WHEN xsolla_transaction_id IS NOT NULL THEN 'transaction_id'
    ELSE NULL
  END,
  created_at,
  last_synced_at
FROM users;

DROP TABLE users;
ALTER TABLE users__new RENAME TO users;

PRAGMA foreign_keys=ON;
