CREATE TABLE IF NOT EXISTS d1_migrations(
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT UNIQUE,
  applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

INSERT OR IGNORE INTO d1_migrations (name) VALUES
  ('2026-02-13_add_subscription_columns.sql'),
  ('2026-03-20_add_daily_routine_claims.sql'),
  ('2026-04-06_add_api_rate_limits.sql'),
  ('2026-04-25_add_xsolla_subscription_id.sql'),
  ('2026-04-25_add_xsolla_transaction_id.sql'),
  ('2026-04-25_add_xsolla_webhook_events.sql'),
  ('2026-04-25_clear_legacy_subscription_plans.sql'),
  ('2026-04-25_refactor_billing_entitlement_columns.sql');
