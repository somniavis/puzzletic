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
  created_at INTEGER,
  last_synced_at INTEGER
);
