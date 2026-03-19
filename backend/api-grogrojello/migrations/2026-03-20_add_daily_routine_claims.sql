CREATE TABLE IF NOT EXISTS daily_routine_claims (
  uid TEXT NOT NULL,
  date_key TEXT NOT NULL,
  claimed_at INTEGER NOT NULL,
  PRIMARY KEY (uid, date_key)
);
