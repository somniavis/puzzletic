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
  is_premium INTEGER DEFAULT 0,
  subscription_end INTEGER DEFAULT 0,
  subscription_plan TEXT,
  created_at INTEGER,
  last_synced_at INTEGER
);

CREATE TABLE daily_routine_claims (
  uid TEXT NOT NULL,
  date_key TEXT NOT NULL,
  claimed_at INTEGER NOT NULL,
  PRIMARY KEY (uid, date_key)
);
