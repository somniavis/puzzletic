# D1 Migration Baseline Runbook

> 마지막 업데이트: 2026-04-25

## 목적

원격 D1의 실제 스키마는 이미 현재 코드 기준으로 정리되어 있지만, `d1_migrations` 기록이 비어 있거나 일부만 남아 있으면 `wrangler d1 migrations apply --remote`가 오래된 migration부터 다시 실행하려고 시도합니다.

현재 저장소에서는 그 결과로 아래 같은 실패가 발생할 수 있습니다.

- `2026-02-13_add_subscription_columns.sql`
- `duplicate column name: is_premium`

즉, 문제의 본질은 "현재 스키마가 부족하다"가 아니라 "Wrangler가 과거 migration을 아직 미적용으로 본다"입니다.

## 현재 결론

- 원격 운영 DB는 **baseline 방식으로 `d1_migrations`만 정상화**하는 것이 맞습니다.
- 이 작업은 일반 migration apply가 아니라 **메타데이터 복구 작업**입니다.
- 따라서 helper SQL은 `backend/api-grogrojello/migrations/`가 아니라 별도 경로에 둡니다.

파일:

- `backend/api-grogrojello/sql/d1_migrations_baseline.sql`

## Wrangler가 기대하는 메타 테이블 형식

로컬 Wrangler 코드 기준으로 기본 migration 테이블 이름은 `d1_migrations`이며, 구조는 아래와 같습니다.

```sql
CREATE TABLE IF NOT EXISTS d1_migrations(
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT UNIQUE,
  applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);
```

Wrangler는 여기서 `name` 컬럼의 migration 파일명과 현재 저장소의 `backend/api-grogrojello/migrations/*.sql` 파일명을 비교해 미적용 migration을 계산합니다.

## Baseline 대상 파일

현재 저장소 기준 baseline 대상은 아래 8개입니다.

1. `2026-02-13_add_subscription_columns.sql`
2. `2026-03-20_add_daily_routine_claims.sql`
3. `2026-04-06_add_api_rate_limits.sql`
4. `2026-04-25_add_xsolla_subscription_id.sql`
5. `2026-04-25_add_xsolla_transaction_id.sql`
6. `2026-04-25_add_xsolla_webhook_events.sql`
7. `2026-04-25_clear_legacy_subscription_plans.sql`
8. `2026-04-25_refactor_billing_entitlement_columns.sql`

## 적용 절차

1. 원격 DB 백업 또는 스냅샷 확보
2. 원격 `users`, `daily_routine_claims`, `api_rate_limits`, `xsolla_webhook_events` 실제 스키마 확인
3. 원격 `d1_migrations` 현재 상태 확인
4. `backend/api-grogrojello/sql/d1_migrations_baseline.sql`를 원격 DB에 1회 실행
5. `SELECT id, name, applied_at FROM d1_migrations ORDER BY id;` 로 파일명 일치 여부 확인
6. 이후 `wrangler d1 migrations apply --remote` 재실행
7. 결과가 `No migrations to apply` 또는 신규 migration만 적용되는지 확인

## 주의사항

- 이 SQL은 **새 migration 파일이 아닙니다.**
- `backend/api-grogrojello/migrations/` 안에 넣으면 안 됩니다.
- 이미 현재 스키마가 반영된 원격 DB에 대해 **baseline만 맞추는 용도**입니다.
- brand-new DB를 처음부터 migration chain만으로 세우는 용도로 쓰면 안 됩니다.

## 추가 리스크 메모

현재 migration chain은 처음부터 완전 자급식 bootstrap 체인이 아닙니다.

- `2026-02-13_add_subscription_columns.sql` 는 기존 `users` 테이블이 있어야 동작합니다.
- 따라서 새 DB를 0부터 세울 때는:
  - 먼저 `backend/api-grogrojello/schema.sql` 로 현재 기준 스키마를 만들고
  - 필요 시 같은 baseline 절차로 `d1_migrations`를 맞춘 뒤
  - 그 다음부터 신규 migration만 누적하는 방식이 더 안전합니다.

이 점은 "원격 운영 DB baseline 정상화"와 "완전한 fresh bootstrap migration chain 구축"을 분리해서 다뤄야 한다는 뜻입니다.
