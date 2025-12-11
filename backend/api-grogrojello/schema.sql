DROP TABLE IF EXISTS users;
CREATE TABLE users (
  uid TEXT PRIMARY KEY,
  email TEXT,
  display_name TEXT,
  level INTEGER DEFAULT 1,
  xp INTEGER DEFAULT 0,
  glo INTEGER DEFAULT 0,
  inventory TEXT DEFAULT '[]',
  created_at INTEGER,
  last_synced_at INTEGER
);
