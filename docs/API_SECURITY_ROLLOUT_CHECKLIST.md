# API 보안 롤아웃 체크리스트

> 대상: `backend/api-grogrojello`
> 마지막 업데이트: 2026-04-06

## 목적

이 문서는 API 보안 하드닝 변경사항을 운영 환경에 안전하게 반영하기 위한 체크리스트입니다.

현재 포함 범위:

- Phase 1: 서버 측 rate limit
- Phase 2: 요청 비용 절감 및 조기 차단
- Phase 3: CORS 역할 재정의 및 structured security logging
- Phase 4: 라이트 게임 데이터 조작 방어

---

## 이번 반영 대상

### Worker 코드

- `backend/api-grogrojello/src/index.js`

### D1 스키마 / 마이그레이션

- `backend/api-grogrojello/schema.sql`
- `backend/api-grogrojello/migrations/2026-04-06_add_api_rate_limits.sql`

### 참고 문서

- `docs/API_SECURITY_HARDENING_PLAN.md`
- `docs/SERVICE_STRUCTURE.md`
- `docs/HYBRID_STORAGE_ARCHITECTURE.md`
- `docs/CHANGELOG.md`

---

## 사전 확인

배포 전에 아래를 먼저 확인합니다.

1. 로컬 Worker 테스트 통과
   - 명령:
   ```bash
   cd backend/api-grogrojello
   npx vitest run --reporter=verbose
   ```

2. 프론트 빌드 통과
   - 명령:
   ```bash
   npm run build
   ```

3. 운영 Worker 설정 확인
   - `wrangler.jsonc` 기준:
     - custom domain: `api.grogrojello.com`
     - D1 binding: `DB`
     - `FIREBASE_PROJECT_ID` 값 확인

4. 운영 반영 범위 인지
   - rate limit 추가로 일부 과도한 API 사용은 `429`를 받을 수 있음
   - sync queue/retry 개선으로 정상 사용자는 자동 완화됨
   - sync 저장은 하이브리드 스토리지 철학에 맞춰 `라이트 검증`만 수행
   - `xp/gro/star` 급증 제한과 기본 타입 검사만 서버에서 수행

5. 현재 로컬 검증 기준 확인
   - Worker 테스트: `15 passed`
   - 프론트 빌드: 통과
   - 참고:
     - vitest 실행 시 Cloudflare runtime compatibility date가 `2025-12-11` 대신 `2025-09-06`으로 fallback되는 경고가 있을 수 있음

---

## 배포 순서

## 1. D1 마이그레이션 적용

먼저 D1에 rate limit 저장 테이블을 추가합니다.

대상 파일:

- `backend/api-grogrojello/migrations/2026-04-06_add_api_rate_limits.sql`

권장 순서:

1. 운영 DB 백업 또는 현행 스키마 확인
2. 아래 SQL 실행

```sql
CREATE TABLE IF NOT EXISTS api_rate_limits (
  key TEXT PRIMARY KEY,
  count INTEGER NOT NULL DEFAULT 0,
  window_start INTEGER NOT NULL,
  last_seen INTEGER NOT NULL,
  blocked_until INTEGER NOT NULL DEFAULT 0
);
```

3. 생성 확인

```sql
SELECT name
FROM sqlite_master
WHERE type = 'table' AND name = 'api_rate_limits';
```

4. 빈 테이블 확인

```sql
SELECT COUNT(*) FROM api_rate_limits;
```

예상 결과:

- 테이블 존재
- 초기 row 수는 `0`

---

## 2. Worker 배포

코드 배포는 D1 마이그레이션 이후 진행합니다.

명령:

```bash
cd backend/api-grogrojello
npm run deploy
```

확인 포인트:

- 배포 에러 없이 완료
- custom domain route 유지
- observability 설정 유지
- `FIREBASE_PROJECT_ID` 유지

참고:

- 현재 `backend/api-grogrojello/package.json`의 배포 명령은 `wrangler deploy`
- 현재 `wrangler.jsonc` 기준 운영 route는 `api.grogrojello.com`, D1 binding은 `DB`

---

## 3. 배포 직후 스모크 테스트

운영 배포 직후 아래 순서로 최소 검증합니다.

### 인증 게이트

1. 브라우저 또는 curl로:
   - `https://api.grogrojello.com/api/users/test`
2. Authorization 없이 호출
3. 기대 결과:
   - `401`
   - `Missing or invalid Authorization header`

### CORS

1. 운영 웹 origin에서 정상 호출
2. 허용되지 않은 origin에서는 브라우저가 차단되는지 확인

### 정상 사용자 GET/POST

1. 실제 테스트 계정 로그인
2. cloud fetch 정상 동작 확인
3. saveToCloud 정상 동작 확인
4. logout 전 저장 정상 동작 확인
5. 다른 기기 또는 새 세션에서 복원 정상 동작 확인

### rate limit

1. 같은 계정으로 짧은 시간 반복 저장 시도
2. 기대 결과:
   - 과도한 호출에 `429`
   - 클라이언트는 retry 후 저장 복구

---

## 4. 운영 로그 확인

배포 후 observability/Worker logs에서 아래 이벤트를 확인합니다.

### 정상 범주

- 소량의 `auth_rejected`
  - 만료 토큰, 잘못된 헤더, 테스트 호출 등
- 드문 `cors_origin_denied`
  - 잘못된 출처에서 OPTIONS 시도

### 주의 범주

- 특정 `ip`에서 반복되는 `auth_rejected`
- 특정 `uid`에 집중되는 `rate_limit_hit`
- 반복적인 `request_shape_rejected`
- `abnormal_value_rejected` 발생

### 바로 조사할 범주

- 한 IP에서 다수 UID 대상 `auth_rejected`
- 한 UID에 대해 짧은 시간 다량 `postauth` 또는 `cooldown` hit
- 정상 사용자 불만과 동시에 `429` 로그 급증
- 정상 플레이만 했는데 `abnormal_value_rejected`가 반복되는 경우

---

## 운영 기준값

현재 기본값은 아래와 같습니다.

### `userRead`

- pre-auth:
  - 10초 8회
  - 1분 20회
- post-auth:
  - 10초 6회
  - 1분 15회

### `userSync`

- pre-auth:
  - 10초 4회
  - 1분 10회
- post-auth:
  - 10초 3회
  - 1분 8회
- cooldown:
  - 약 2초

### `dailyRoutineClaim`

- pre-auth:
  - 10초 2회
  - 1분 3회
- post-auth:
  - 10초 2회
  - 1분 3회

### `auth failure`

- 1분 5회
- 15분 12회

---

## 사용자 영향 모니터링

배포 후 아래 사용자 경험 이슈가 없는지 확인합니다.

1. 로그인 후 cloud 복원 지연
2. save 버튼 실패 증가
3. logout 직전 저장 실패 증가
4. 신규 계정 초기화 지연
5. daily routine claim 실패 증가
6. 정상 플레이 후 cloud 저장 누락 증가

특히 아래 흐름은 직접 점검합니다.

- 로그인 직후 기존 캐릭터 복원
- 빠른 연속 행동 후 cloud 저장
- logout 직전 저장
- 다른 기기에서 복원

추가 확인:

- 일반 플레이 후 `star` 증가가 정상 저장되는지
- 과도한 연타 저장 외에는 `429`가 거의 발생하지 않는지

---

## 롤백 기준

아래 중 하나면 즉시 완화 또는 롤백을 검토합니다.

1. 정상 사용자 `429` 비율이 눈에 띄게 증가
2. logout 직전 저장 실패가 반복 보고됨
3. 로그인 복원 실패 또는 신규 계정 초기화 이상 다수 보고
4. Worker 로그가 지나치게 폭증해 운영 관측이 어려워짐
5. 정상 사용자 sync가 `abnormal_value_rejected`로 막히는 사례가 반복 보고됨

완화 방법:

1. rate limit 수치 상향
2. 특정 route group cooldown 완화
3. structured log 범위 축소
4. `abnormal_value_rejected` 로그 기준 재조정
5. 필요 시 Worker 코드 롤백

---

## 후속 작업

다음 보안 작업 후보:

1. 결제 검증 고도화 (`purchase/cancel` 실결제 검증)
2. Cloudflare 레벨 WAF / Rate Limiting Rules 추가
3. 보안 로그 대시보드화
4. 토큰 탈취 이후 대응 전략 정리
