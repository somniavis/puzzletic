-- Clear legacy pre-Xsolla subscription states.
-- This only targets old internal plan ids that should no longer exist.
-- Historical cleanup for legacy schema before the entitlement refactor.

UPDATE users
SET
  is_premium = 0,
  subscription_end = 0,
  subscription_plan = NULL,
  xsolla_subscription_id = NULL,
  xsolla_transaction_id = NULL
WHERE subscription_plan IN ('3_months', '12_months');
