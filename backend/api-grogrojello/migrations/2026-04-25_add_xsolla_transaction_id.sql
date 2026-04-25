-- Historical migration.
-- Adds a legacy Xsolla reference column used before the entitlement refactor.

ALTER TABLE users ADD COLUMN xsolla_transaction_id INTEGER;
