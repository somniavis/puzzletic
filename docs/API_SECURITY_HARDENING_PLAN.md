# API 보안 하드닝 계획

> 마지막 업데이트: 2026-04-06

## 개요

이 문서는 `Cloudflare Worker + Firebase ID Token + D1` 기반 현재 API 구조를 기준으로,
`토큰 탈취 이후 무한 요청/서버 남용` 위험을 줄이기 위한 보안 보완 계획을 정리한 문서입니다.

이번 단계에서는 아래 3가지를 우선 대상으로 봅니다.

1. 탈취된 토큰으로 특정 사용자 API를 무한 호출할 수 있는 구조
2. 요청 1회당 인증/DB 비용이 누적되어 서버 자원이 소모되는 구조
3. CORS allowlist가 있어도 서버 간 직접 호출 공격은 막지 못하는 구조

결제 검증 고도화(`purchase/cancel` 실결제 검증)는 별도 트랙으로 진행합니다.

추가로 이번 라운드부터는 `클라이언트 게임 데이터 조작`도 함께 방어합니다.

---

## 현재 구조 요약

현재 Worker는 `/api/users/:uid*` 경로에 대해 다음 순서로 동작합니다.

1. `Authorization: Bearer <Firebase ID Token>` 존재 확인
2. Firebase JWK 기반 서명 검증
3. `token.sub === :uid` 확인
4. 엔드포인트별 D1 read/write 수행

즉, **"이 요청이 진짜 해당 유저 본인인가"** 는 확인하지만,
**"너무 많이 요청하고 있지는 않은가"**, **"짧은 시간에 같은 행위를 반복하고 있지는 않은가"** 는 아직 확인하지 않습니다.

---

## 확인된 문제

### 1. 서버 측 Rate Limit 부재

현재 Worker에는 아래 제한이 없습니다.

- UID 기준 요청 횟수 제한
- IP 기준 요청 횟수 제한
- 엔드포인트별 버스트 제한
- 실패 요청 누적 차단
- 동일 행위 반복 요청 쿨다운

영향:

- 탈취된 토큰으로 `GET /api/users/:uid`, `POST /api/users/:uid` 등을 무한 호출 가능
- D1 read/write 비용 증가
- Worker CPU 사용량 증가
- 특정 사용자 단위 자원 고갈 또는 운영비 상승 가능

---

### 2. 요청당 비용이 낮지 않음

현재 요청은 대부분 아래 비용을 포함합니다.

- JWT 파싱
- Firebase 공개키 조회 또는 캐시 사용
- 서명 검증
- D1 조회 또는 쓰기
- 일부 엔드포인트의 추가 로직 실행

즉, 단순 인증 실패 처리 수준이 아니라,
**정상 형식의 토큰을 가진 반복 요청**은 Worker와 D1에 실질적인 부하를 줍니다.

특히 아래 엔드포인트는 공격자가 반복 호출 대상으로 삼기 쉽습니다.

- `GET /api/users/:uid`
- `POST /api/users/:uid`
- `POST /api/users/:uid/daily-routine-claim`

---

### 3. CORS는 직접 호출 공격 방어가 아님

현재 Worker는 `Origin` allowlist를 사용하지만, 이는 브라우저 기반 요청 제어에 가깝습니다.

한계:

- 공격자가 브라우저가 아닌 서버/스크립트에서 직접 호출하면 CORS와 무관
- 탈취된 Firebase ID Token을 붙여 직접 요청하면 CORS로 방어 불가

따라서 CORS는 유지하되, 이것을 API 남용 방어책으로 간주하면 안 됩니다.

---

## 보안 목표

우리가 이번 하드닝에서 달성하려는 목표는 아래와 같습니다.

1. 탈취된 토큰이 있어도 `짧은 시간 무한 호출`은 서버에서 차단
2. 요청이 인증되더라도 `비정상 빈도`면 비용 큰 작업 전에 빠르게 거절
3. 동일 사용자의 반복 요청은 `UID 단위`로 제어
4. 다수 사용자/봇성 접근은 `IP 단위`로도 2차 방어
5. CORS와 별개로 서버 자체 방어 계층을 명확히 구축

---

## 적용 원칙

### 1. 빠른 거절 우선

비용 큰 로직보다 먼저 막아야 합니다.

권장 순서:

1. 경로 판별
2. 최소 헤더 검사
3. Rate Limit 검사
4. 인증 검증
5. DB read/write

주의:

- UID 기반 limit는 토큰 검증 전에는 완전 신뢰할 수 없으므로,
  `경로 uid + 클라이언트 IP` 기준의 1차 limit와
  `인증 후 claims.sub` 기준의 2차 limit를 함께 두는 방식이 안전합니다.

### 2. 엔드포인트별 제한 분리

모든 API를 한 묶음으로 제한하면 정상 사용성도 손상됩니다.

권장 분리:

- `GET /api/users/:uid`: 비교적 여유 있게 허용
- `POST /api/users/:uid`: 더 엄격하게 제한
- `POST /api/users/:uid/daily-routine-claim`: 매우 엄격하게 제한

### 3. 방어는 중복되어야 함

한 계층이 뚫려도 다른 계층이 남아 있어야 합니다.

- Cloudflare 레벨의 edge rate limit
- Worker 내부 logical rate limit
- 엔드포인트별 idempotency 또는 중복 요청 차단
- 이상 요청 로깅

---

## 단계별 실행 계획

## Phase 1. Worker 내부 Rate Limit 추가

가장 먼저 적용할 항목입니다.

### 적용 상태

- 적용 완료: 2026-04-06
- 저장소: D1 `api_rate_limits` 테이블
- 마이그레이션 파일:
  - `backend/api-grogrojello/migrations/2026-04-06_add_api_rate_limits.sql`

### 목표

- 동일 UID/IP 조합의 과도한 요청 차단
- 인증 성공 후 동일 사용자 반복 요청 추가 차단
- 엔드포인트별 버스트 제어

### 권장 구현

Worker에 Rate Limit 유틸을 추가하고, 최소 아래 키 체계를 사용합니다.

- `preauth:${ip}:${uid}:${routeGroup}`
- `auth:${claims.sub}:${routeGroup}`

`routeGroup` 예시:

- `user-read`
- `user-sync`
- `daily-routine-claim`

### 저장소 선택

운영 안정성을 위해 아래 둘 중 하나를 사용합니다.

1. `Cloudflare Rate Limiting / WAF`
2. `Workers KV` 또는 `Durable Object` 기반 카운터

권장 판단:

- 빠른 1차 방어: Cloudflare edge limit
- 앱 로직에 맞춘 정교한 제한: Worker 내부 저장소

### 초안 제한값

초기 운영값은 아래처럼 시작하는 것이 안전합니다.

| 그룹 | 제한 예시 |
|------|-----------|
| `user-read` | pre-auth: 1분 20회 / 10초 8회, post-auth: 1분 15회 / 10초 6회 |
| `user-sync` | pre-auth: 1분 10회 / 10초 4회, post-auth: 1분 8회 / 10초 3회, 추가 2초 cooldown |
| `daily-routine-claim` | pre-auth: 1분 3회 / 10초 2회, post-auth: 1분 3회 / 10초 2회 |
| `auth-failure` | 1분 5회, 15분 12회 초과 시 단계적 차단 |

### 기대 효과

- 탈취 토큰 기반 스팸 요청 즉시 완화
- D1 접근량 감소
- Worker CPU 사용량 감소
- 하이브리드 스토리지의 L3 반영 타이밍을 제어 가능한 형태로 유지

### 실제 적용 구조

현재 Worker는 아래 순서로 요청을 방어합니다.

1. `preauth:${ip}:${uid}:${routeGroup}` 기준 버스트/윈도우 제한
2. 인증 실패 시 `authfail:${ip}:${uid}` 누적
3. 인증 성공 후 `auth:${uid}:${routeGroup}` 기준 버스트/윈도우 제한
4. `POST /api/users/:uid` 에 대해 사용자별 cooldown 적용

응답 정책:

- 제한 초과 시 `429 Too Many Requests`
- `Retry-After` 헤더 반환
- 응답 body에 `reason`, `retryAfterSeconds` 포함

### 하이브리드 스토리지 영향 및 보완

서버에 rate limit을 추가하면 `L1 Memory`, `L2 localStorage`, `L3 Cloud` 중
`L3 업로드 타이밍`이 가장 먼저 영향을 받습니다.

이를 완화하기 위해 클라이언트 동기화 계층에 아래 보완을 함께 적용했습니다.

1. `syncUserData()` 호출 coalescing
   - 짧은 시간 연속 호출이 들어와도 마지막 상태만 모아서 1회 업로드
2. 클라이언트 측 최소 sync 간격 유지
   - 서버 cooldown과 충돌하지 않도록 약 `2.2초` 간격 유지
3. `429 Retry-After` 자동 재시도
   - 서버가 잠시 막아도 마지막 상태를 버리지 않고 다시 업로드
4. 로그아웃 직전 저장도 동일 큐 사용
   - 즉시 실패 대신 예약된 업로드 완료를 기다리는 구조로 정렬

결론:

- rate limit 도입 후에도 하이브리드 스토리지의 핵심 원칙은 유지
- 다만 "즉시 여러 번 업로드"에서 "합쳐서 안전하게 업로드"로 동작 특성이 바뀜
- 이는 데이터 유실 방지 측면에서 오히려 더 안정적인 방향

---

## Phase 2. 요청 비용 절감 및 조기 차단

Rate Limit 다음 단계입니다.

### 적용 상태

- 적용 완료: 2026-04-06
- 클라이언트:
  - `fetchUserData` in-flight dedupe
  - 짧은 TTL 캐시로 로그인 직후 중복 GET 완화
- Worker:
  - 허용 메서드 선검사
  - 허용 서브경로 선검사
  - JSON 필수 POST에 대한 `Content-Type` 선검사
  - 과도한 body 크기 선검사

### 목표

- 비정상 요청을 가능한 한 빨리 거절
- 불필요한 DB 접근 줄이기
- 반복적으로 같은 데이터를 읽는 흐름 최적화

### 적용 항목

1. 인증 전 저비용 검사 강화

- 허용 메서드 외 요청 조기 종료
- 경로 형식 불일치 조기 종료
- 잘못된 `Authorization` 헤더 즉시 종료

2. 엔드포인트별 쿨다운/중복 방지

- `daily-routine-claim`는 이미 DB 차단이 있지만,
  Rate Limit 이전에도 짧은 시간 재시도 자체를 줄일 수 있도록 쿨다운 추가

3. GET 응답 캐시 전략 검토

- 민감 데이터 특성상 공개 캐시는 불가
- 단, 동일 세션 내 과도한 재호출은 프론트 단에서도 줄이도록 조정 가능

4. 클라이언트 반복 fetch 정리

현재 로그인 시점과 일부 구독 관련 흐름에서 `fetchUserData`가 중복 호출될 수 있습니다.
이는 악성 공격과 별개로 정상 트래픽 비용을 조금씩 키웁니다.

### 실제 적용 내용

1. `fetchUserData` 요청 공유

- 같은 사용자에 대한 동시 GET 요청은 같은 Promise를 공유
- 로그인 직후 `AuthContext`와 `useNurturingSync`가 거의 동시에 조회해도 1회만 네트워크 요청 수행

2. 짧은 TTL 캐시

- 최근 성공 응답은 약 `5초`
- `notFound`는 약 `1초`
- 재로그인 직후 중복 조회와 불필요한 D1 read를 완화

3. Worker 조기 차단

- `GET`, `POST`, `OPTIONS` 외 메서드는 인증 전 `405`
- 허용되지 않은 `/api/users/:uid/*` 서브경로는 인증 전 `404`
- body가 필요한 POST에서 JSON이 아니면 인증 전 `415`
- body가 과도하면 인증 전 `413`

### 기대 효과

- 정상 사용자 트래픽의 중복 GET 감소
- 잘못된 요청이 JWT 검증/JWK 조회/D1 read-write 단계까지 진입하는 비율 감소
- 서버 비용과 응답 지연 모두 완화

### 기대 효과

- 합법 사용자 트래픽의 기본 비용 절감
- 공격 트래픽이 내부 비싼 경로까지 도달하는 비율 감소

---

## Phase 3. CORS의 역할 재정의 + 직접 호출 방어 보완

이 단계는 "CORS를 없앤다"가 아니라, 책임 범위를 명확히 하는 단계입니다.

### 적용 상태

- 적용 완료: 2026-04-06
- Worker structured security logging 추가
- 아키텍처 문서에 CORS 책임 범위 명시

### 핵심 원칙

- CORS는 브라우저 출처 제어
- Rate Limit는 남용 제어
- 인증은 사용자 식별
- 엔드포인트 로직은 권한/행위 검증

### 적용 항목

1. 문서 명시

- CORS는 직접 호출 공격 방어가 아님을 아키텍처 문서에 명시

2. 서버 관측값 추가

- `CF-Connecting-IP`, route group, auth success/fail, limit hit 여부를 로깅

### 실제 적용 내용

1. Structured security logs

- Worker가 JSON 한 줄 형식의 보안 이벤트 로그를 남기도록 추가
- 주요 이벤트:
  - `cors_origin_denied`
  - `invalid_api_path`
  - `request_shape_rejected`
  - `auth_rejected`
  - `rate_limit_hit`
  - `abnormal_value_rejected`

2. 로그 필드 표준화

- `requestId`
- `ip`
- `uid`
- `routeGroup`
- `path`
- `method`
- `retryAfterMs`

3. 운영 해석 기준 명확화

- CORS 차단 로그는 "브라우저 origin 불일치" 의미
- 실제 남용/탈취 탐지는 `auth_rejected`, `rate_limit_hit`, `abnormal_value_rejected` 중심으로 판단

### 기대 효과

- 보안 이벤트를 운영에서 빠르게 검색 가능
- CORS와 직접 호출 방어를 혼동하지 않게 됨
- 특정 uid/ip 기준으로 차단 패턴을 추적하기 쉬워짐

3. 운영 룰 정리

- 특정 IP 대역 또는 국가 차단이 필요할 경우 Cloudflare 레벨에서 대응 가능하게 준비

### 기대 효과

- 방어 역할 혼동 제거
- 운영 시 대응 속도 향상

---

## Phase 4. 게임 데이터 조작 방어

이 단계는 "토큰은 정상인데 payload 값이 비정상적인 경우"를 막는 단계입니다.

### 적용 상태

- 적용 완료: 2026-04-06
- Worker sync payload 라이트 검증 적용
- 프로덕션 빌드에서 디버그 액션 비노출 처리

### 위협 모델

- 클라이언트 콘솔/프록시를 통한 `xp`, `gro`, `star` 직접 수정
- 디버그 함수 호출로 별/해금 상태를 비정상 증폭

### 실제 적용 내용

1. 서버 측 필드 검증 강화

- `level`: 안전한 정수이며 `1..5` 범위인지 검사
- `xp`, `gro`, `star`: 음수/비정상 범위 차단
- `current_land`: 비어 있지 않은 문자열인지 검사
- `inventory`: 배열 형식인지 검사

2. 기존 delta 검사 확장

- 기존 `gro`, `xp` 급증 제한 유지
- `star` 급증 제한 추가
- 신규 유저 초기값도 `xp`, `gro`, `star` 범위 제한

3. 프로덕션 디버그 액션 차단

- `debugAddStars`, `debugUnlockAllGames`는 개발 빌드에서만 동작
- Profile 페이지의 디버그 버튼 묶음은 `import.meta.env.DEV`일 때만 렌더

### 기대 효과

- 클라이언트 조작만으로는 cloud 진행도 위변조가 어려워짐
- 하이브리드 스토리지 흐름을 과도하게 막지 않으면서 급격한 수치 위변조를 억제
- 운영 로그로 비정상 증폭 시도를 식별하기 쉬워짐

---

## 구현 우선순위

이번 작업은 아래 순서로 진행합니다.

1. 이 문서 작성 및 기준 확정
2. Worker 내부 Rate Limit 설계 및 적용
3. 엔드포인트별 요청 비용 절감 작업
4. CORS 역할 재정의 및 운영 로그 보강
5. 게임 데이터 조작 방어 적용

---

## 변경 대상 파일 후보

### 우선 수정

- `backend/api-grogrojello/src/index.js`

### 함께 볼 파일

- `src/services/syncService.ts`
- `src/contexts/hooks/useNurturingSync.ts`
- `src/contexts/AuthContext.tsx`
- `docs/SERVICE_STRUCTURE.md`
- `docs/HYBRID_STORAGE_ARCHITECTURE.md`

---

## 이번 턴의 결론

현재 구조는 `인증은 존재하지만 남용 제어는 부족한 상태`입니다.

따라서 첫 번째 실제 수정 작업은 `Phase 1: Worker 내부 Rate Limit 추가`가 적절합니다.
이 작업이 끝나면, 다음으로 `정상 트래픽 기준 중복 호출 정리`와 `조기 차단 최적화`를 이어갑니다.
