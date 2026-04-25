# D1 Migrations Notes

이 폴더의 SQL 파일은 **현재 운영 DB에 순차 적용되었던 historical migration chain**입니다.

중요:

- 이 체인은 brand-new D1 데이터베이스를 0부터 안전하게 bootstrap하는 완전한 체인이 아닙니다.
- 특히 초기 migration들은 기존 `users` 테이블이나 legacy billing 컬럼이 이미 존재한다는 전제를 가집니다.
- 따라서 새 DB를 처음 만들 때는 이 폴더만 보고 `wrangler d1 migrations apply`를 바로 신뢰하면 안 됩니다.

## 권장 원칙

### 1. 새 DB를 처음 만들 때

- 먼저 `../schema.sql` 로 현재 기준 스키마를 생성합니다.
- 그 다음 운영 이력과 migration metadata를 맞춰야 할 필요가 있으면
  - `../sql/d1_migrations_baseline.sql`
  - `../../docs/D1_MIGRATION_BASELINE_RUNBOOK.md`
  를 기준으로 baseline을 맞춥니다.

### 2. 기존 운영 DB를 유지보수할 때

- 이 폴더의 migration 파일명과 remote `d1_migrations` 기록이 일치하는지 먼저 확인합니다.
- 기록이 어긋난 상태라면 일반 migration apply보다 baseline 복구를 먼저 해야 합니다.

## 현재 주의 대상

- `2026-02-13_add_subscription_columns.sql`
- `2026-04-25_add_xsolla_subscription_id.sql`
- `2026-04-25_add_xsolla_transaction_id.sql`
- `2026-04-25_clear_legacy_subscription_plans.sql`
- `2026-04-25_refactor_billing_entitlement_columns.sql`

위 파일들은 모두 legacy billing schema에서 현재 entitlement schema로 넘어가는 과정의 일부입니다.

즉:

- historical migration 관점에서는 필요
- fresh bootstrap 관점에서는 그대로 재실행하면 안 될 수 있음
