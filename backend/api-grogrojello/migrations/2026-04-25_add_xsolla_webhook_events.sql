CREATE TABLE IF NOT EXISTS xsolla_webhook_events (
  event_key TEXT PRIMARY KEY,
  notification_type TEXT NOT NULL,
  uid TEXT,
  product_id TEXT,
  xsolla_transaction_id INTEGER,
  xsolla_subscription_id INTEGER,
  processing_status TEXT NOT NULL DEFAULT 'processing',
  processed_at INTEGER NOT NULL
);
