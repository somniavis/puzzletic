# Billing Operations Runbook

> 마지막 업데이트: 2026-04-25
> 범위: 현재 Xsolla + Cloudflare Worker + D1 결제 운영 기준

## 목적

이 문서는 현재 결제 시스템의 운영 기준을 하나로 묶는다. 구현 세부사항보다 운영자가 실제로 확인해야 하는 상태값, SQL, 장애 대응 순서를 우선한다.

관련 상세 문서:

- `docs/XSOLLA_SANDBOX_INTEGRATION_CHECKLIST.md`
- `docs/D1_MIGRATION_BASELINE_RUNBOOK.md`
- `docs/SERVICE_STRUCTURE.md`

## 현재 기준

- 결제 provider: `Xsolla`
- 서버: `Cloudflare Worker`
- 저장소: `D1`
- 권한 부여 기준:
  - 프론트 결제 성공 UI가 아니라 `POST /api/xsolla/webhook` 처리 결과
- 현재 canonical 상태 컬럼:
  - `entitlement_status`
  - `entitlement_kind`
  - `entitlement_plan`
  - `entitlement_end`
  - `billing_provider`
  - `billing_reference_id`
  - `billing_reference_type`

레거시 주의:

- `/api/users/:uid/purchase` 직접 지급 흐름은 더 이상 운영 경로가 아니다.
- 현재 checkout 시작 경로는 `POST /api/users/:uid/xsolla/checkout-token` 이다.
- 레거시 `is_premium`, `subscription_plan`, `subscription_end` 표현은 historical 문맥이 아니면 새 문서에 쓰지 않는다.

## 상태 해석

- `entitlement_status = inactive`
  - 활성 권한 없음
- `entitlement_status = active`
  - 현재 premium 권한 활성
- `entitlement_status = non_renewing`
  - 구독은 종료 예정이지만 현재 기간까지 권한 유지

- `entitlement_kind = subscription`
  - 반복 결제형 상품
- `entitlement_kind = duration`
  - 기간형 one-time 상품

- `billing_reference_type = subscription_id`
  - subscription webhook 기준 식별자
- `billing_reference_type = transaction_id`
  - duration webhook 기준 식별자

## Fresh Bootstrap 기준

새 D1를 처음 만들 때 기준은 historical migration chain이 아니라 현재 canonical schema다.

사용 기준:

1. `backend/api-grogrojello/schema.sql` 로 현재 스키마를 만든다.
2. 이후 새 변경부터 migration 파일을 추가한다.
3. 오래된 migration 파일은 historical reference로만 본다.

이유:

- 현재 원격 D1는 historical migration chain과 `d1_migrations` 기록이 어긋나 있다.
- fresh bootstrap에 과거 migration 전체를 다시 재적용하려 하면 중복 컬럼 오류가 날 수 있다.

## Remote Migration Baseline

원격 D1 migration history 정상화는 아래 문서를 기준으로 진행한다.

- `docs/D1_MIGRATION_BASELINE_RUNBOOK.md`

현재 준비된 산출물:

- helper SQL: `backend/api-grogrojello/sql/d1_migrations_baseline.sql`
- Wrangler 설정: `backend/api-grogrojello/wrangler.jsonc`

현재 blocker:

- 2026-04-25 기준 `wrangler login` OAuth 경로가 반복적으로 실패했다.
- 관찰된 오류:
  - `503`
  - `no healthy upstream`
  - `upstream connect error or disconnect/reset before headers`

운영 방침:

1. OAuth가 복구되면 remote `d1_migrations` 조회부터 다시 시작한다.
2. 필요 시 `CF_API_TOKEN` 방식으로 우회한다.
3. baseline 완료 전까지는 원격 스키마 변경이 필요하면 직접 SQL 반영 여부를 더 엄격히 검토한다.

## 결제 장애 확인 순서

결제 이슈가 발생하면 아래 순서대로 본다.

1. 프론트 결제창 종료 여부가 아니라 서버 상태 재조회 결과를 본다.
2. `users` 테이블 entitlement 상태를 확인한다.
3. `xsolla_webhook_events` 에 해당 이벤트가 `processed`, `duplicate`, `failed` 중 무엇으로 남았는지 확인한다.
4. `billing_reference_id` 와 환불 또는 취소 이벤트의 reference가 일치하는지 확인한다.
5. 필요하면 Xsolla 콘솔에서 transaction 또는 subscription 상태를 대조한다.

## 최소 확인 SQL

현재 사용자 entitlement 확인:

```sql
SELECT
  uid,
  entitlement_status,
  entitlement_kind,
  entitlement_plan,
  entitlement_end,
  billing_provider,
  billing_reference_id,
  billing_reference_type,
  last_synced_at
FROM users
WHERE uid = ?;
```

최근 webhook event 확인:

```sql
SELECT
  event_type,
  event_fingerprint,
  processing_status,
  created_at,
  processed_at,
  error_message
FROM xsolla_webhook_events
WHERE uid = ?
ORDER BY created_at DESC
LIMIT 20;
```

활성 entitlement 전체 상태 확인:

```sql
SELECT
  COUNT(*) AS total_users,
  SUM(CASE WHEN entitlement_status = 'active' THEN 1 ELSE 0 END) AS active_users,
  SUM(CASE WHEN entitlement_status = 'non_renewing' THEN 1 ELSE 0 END) AS non_renewing_users
FROM users;
```

## 현재 엔드포인트 기준

- `POST /api/users/:uid/xsolla/checkout-token`
  - 결제창 토큰 발급
- `POST /api/users/:uid/cancel`
  - 구독 비갱신 처리 요청
- `POST /api/xsolla/webhook`
  - 실제 entitlement 반영 기준
- `GET /api/users/:uid`
  - 현재 entitlement 상태 조회

레거시 참고:

- `POST /api/users/:uid/purchase` 는 제거 대상이 아니라 이미 차단된 경로다.
- 현재는 호출 시 `404 Unknown API path` 가 맞는 동작이다.

## Deferred Items

아직 남아 있는 결제 후속 작업:

- 원격 `d1_migrations` baseline 실제 적용
- 기간권 `refund` / `order_canceled` 실 webhook 검증
- 필요 시 `CF_API_TOKEN` fallback 절차 별도 문서화
