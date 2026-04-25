# Xsolla 샌드박스 결제 연동 체크리스트

> 마지막 업데이트: 2026-04-25
> 상태: 레거시 코드/데이터 정리 완료, 최소 event ledger + 웹훅 멱등 처리 완료, 결제 상태 모델을 `entitlement_*` / `billing_reference_*` 구조로 전환 완료, 다음 우선순위는 `샌드박스 실결선 재검증`과 `D1 migration history 정상화`
> 현재 확인: Xsolla 결제 페이지 iframe 오버레이, webhook 기반 entitlement 반영, 구독 취소 `non_renewing` UX, 원격 D1 레거시 plan(`3_months`, `12_months`) 22건 초기화 완료, `xsolla_webhook_events` 원격 생성 완료, 원격 D1 `users` entitlement 스키마 반영 완료, duplicate `order_paid/create_subscription/update_subscription/cancel_subscription/non_renewal_subscription/refund` 테스트 통과, `mismatched refund transaction` 무시 테스트 추가

## 목적

이 문서는 `Puzzleletic`에 Xsolla 기반 결제 시스템을 **샌드박스 모드부터 안전하게** 붙이기 위한 전체 단계와 체크리스트를 정리합니다.

현재 코드베이스 기준 전제:

- 프론트엔드: `Vite + React`
- 인증: `Firebase Auth`
- 백엔드: `Cloudflare Worker + D1`
- 현재 구독 관련 서비스 경로:
  - `POST /api/users/:uid/xsolla/checkout-token`
  - `POST /api/users/:uid/cancel`
  - `POST /api/xsolla/webhook`
- 레거시 `/purchase` 직접 지급 흐름은 제거 대상으로 관리하며, 실제 premium 반영은 Xsolla webhook 검증 후에만 수행한다

## 목표

1. 샌드박스 결제 토큰 발급과 결제창 호출을 연결한다.
2. 프론트 성공 콜백이 아니라 **Xsolla 웹훅 검증 후** 프리미엄을 부여한다.
3. 가격, 권한, 구독 기간, 결제 상태를 모두 서버 기준으로 관리한다.
4. 운영 전환 전에 필요한 보안 취약점을 사전 차단한다.

## 현재 판단

현재 구조는 "프론트 성공 UI가 아니라 서버 webhook 검증 후 premium 반영"이라는 큰 방향은 맞다.

하지만 운영 전환 전에 반드시 정리해야 하는 핵심 문제는 아래 3가지다.

1. 멱등 처리 1차는 완료됐지만 모든 webhook 타입에 대한 중복 검증이 끝난 것은 아니다.
2. 단일 활성 entitlement 정책에 맞는 최소 reference 검증은 들어갔지만, 샌드박스 실결선으로 새 entitlement 스키마를 아직 재검증하지 않았다.
3. 원격 D1의 실제 스키마와 `d1_migrations` 기록이 어긋나 있어 일반적인 migration apply가 실패한다.

## 상태 규칙

- `[ ]` 미착수
- `[-]` 진행 중
- `[x]` 완료
- `[!]` 차단 이슈 또는 사용자 확인 필요

## 현재 확인된 핵심 리스크

1. 프론트/운영 문서에 남아 있는 레거시 결제 표현이 있으면 실제 Xsolla 전용 흐름과 혼선이 생길 수 있다.
2. 프론트에서 결제 성공처럼 보이는 상태와 실제 정산 완료 상태를 혼동하면 권한 오지급이 발생한다.
3. Xsolla API Key, webhook secret을 프론트에 노출하면 결제 위변조 가능성이 커진다.
4. webhook 멱등 처리 범위가 부족하면 일부 이벤트에서 재전송 시 중복 지급/중복 회수가 발생할 수 있다.
5. duration refund/cancel이 현재 entitlement의 `billing_reference_id` 와 일치하는지 검증하지 않으면 잘못된 회수가 발생할 수 있다.
6. 원격 D1의 `d1_migrations` 기록 불일치로 이후 배포 마이그레이션이 깨질 수 있다.

## 현재까지 반영 사항

### 서버/결제 구조

- [x] 레거시 `/purchase` 직접지급 제거 시작
- [x] Xsolla checkout token 발급 경로 추가
- [x] sandbox / production checkout URL 분기 추가
- [x] `XSOLLA_ENV` 기반 subscription mode / catalog sandbox 분리
- [x] webhook 서명 검증 및 기본 premium 반영 구현
- [x] 구독 취소를 `canceled`가 아닌 `non_renewing` 의미로 수정
- [x] 결제 상태 컬럼을 `entitlement_*` / `billing_reference_*` 구조로 재설계 시작
- [x] return URL이 허용 origin 또는 `XSOLLA_RETURN_URL`을 따르도록 수정
- [x] 원격 D1에서 레거시 `subscription_plan IN ('3_months', '12_months')` 22건 초기화 완료
- [x] 최소 Xsolla webhook event ledger 추가
- [x] webhook 중복 재전송 멱등 처리 1차 구현
- [x] 원격 D1에 `xsolla_webhook_events` 테이블 직접 반영 완료
- [x] refund/order_canceled가 현재 duration entitlement의 `billing_reference_id(transaction_id)` 와 일치할 때만 회수되도록 보강
- [ ] 이용권 환불 API 연동은 아직 보류

### 프론트/UX

- [x] Xsolla checkout을 full-screen iframe overlay로 오픈
- [x] 결제 준비 중 로딩 오버레이 및 중복 클릭 방지
- [x] 결제 종료 후 서버 상태 재조회 기본 연결
- [x] 구독 취소 확인 모달 문구를 “즉시 혜택 상실”이 아닌 “현재 구독 종료일까지 유지” 의미로 수정
- [x] 구독 취소 성공 후 시스템 `alert` 제거
- [x] 구독 취소 후 `Cancel Subscription` 버튼 대신 `Auto-Renew Off` 상태 배지 표시
- [x] 주요 다국어 문구 동기화

### 현재 정책 상태

- [x] 구독형 상품:
  - 서비스 내 `구독 취소` 가능
  - 취소 시 `non_renewing`
  - 현재 구독 종료일까지 premium 유지
  - 다음 결제만 중단
- [ ] 이용권 상품:
  - 서비스 내 환불 미지원
  - 별도 refund 정책/API/webhook 설계 후 재개 예정

## 최적화 우선순위

이 문서의 남은 작업은 아래 순서로 진행한다. 이전 구조가 비합리적이면 부분 수정이 아니라 새 구조로 교체한다.

### Priority 1. entitlement 스키마 전환

- 목적:
  - 구독/이용권을 같은 권한 모델로 관리하되, Xsolla 원천 식별은 타입과 함께 저장한다.
- 이유:
  - 현재 서비스는 `동시에 활성 이용권 1개` 정책이라 복잡한 거래 누적 테이블보다 `현재 entitlement + reference 검증`이 더 적합하다.
- 산출물:
  - `entitlement_status`, `entitlement_kind`, `entitlement_plan`, `entitlement_end`
  - `billing_provider`, `billing_reference_id`, `billing_reference_type`
  - 현재 구현:
    - 로컬 코드/테스트 기준 전환 진행
    - 원격 D1 반영 완료

### Priority 2. 웹훅 멱등 처리

- 목적:
  - 동일 `order_paid`, `create_subscription`, `update_subscription`, `non_renewal_subscription`, `refund` 이벤트 재전송 시 중복 반영을 막는다.
- 이유:
  - 현재 가장 직접적인 금전/권한 오지급 위험이다.
- 산출물:
  - webhook 수신 시 event fingerprint 생성
  - 이미 처리된 이벤트면 DB 반영 생략
  - 성공/중복/실패 상태 기록
  - 현재 구현:
    - subscription / duration webhook fingerprint 생성
    - `INSERT OR IGNORE` 기반 claim
    - `processed` / `failed` 상태 기록
    - duplicate `order_paid/create_subscription/update_subscription/cancel_subscription/non_renewal_subscription/refund` 테스트 통과

### Priority 3. 환불/취소 정책 재설계

- 목적:
  - 현재의 "이용권 환불 미지원"과 "duration 전체 revoke" 구조를 거래 단위로 바꾼다.
- 이유:
  - 거래 기록과 멱등 처리 없이 환불을 먼저 붙이면 오회수 가능성이 크다.
- 산출물:
  - 거래 단위 revoke 로직
  - duration/refund 이벤트 정책 명문화
  - 보안 기준:
    - 사용자 전체 상태를 뭉뚱그려 회수하지 않는다
    - 반드시 거래 단위 또는 event 단위로 회수 대상을 식별한다

### Priority 4. 프론트 상태 확정 로직 보강

- 목적:
  - checkout 종료 UI와 실제 premium 상태를 더 명확히 분리한다.
- 이유:
  - 사용자가 "결제 성공처럼 보였는데 적용이 안 됨" 또는 반대로 "적용된 것처럼 보임" 혼선을 겪지 않게 해야 한다.
- 산출물:
  - pending / confirmed / failed 상태 정리
  - 결제 종료 후 서버 재조회 실패 UX 보강

### Priority 5. `d1_migrations` 정상화

- 목적:
  - 향후 D1 스키마 변경을 일반적인 migration apply 흐름으로 복구한다.
- 이유:
  - 현재는 직접 SQL 실행으로는 작업이 가능하지만, 운영 마이그레이션 체인이 깨져 있다.
- 산출물:
  - 원격 DB 실제 스키마와 migration 파일 대응표
  - `d1_migrations` 정리 또는 baseline 재설정
  - 이후 migration apply 재검증

## 단계별 진행 순서

1. 거래 기록용 D1 스키마 설계 및 테이블 추가
2. 웹훅 처리부를 거래 기록 기반 구조로 리팩터링
3. 멱등 처리와 실패/중복 이벤트 로깅 추가
4. 기간형 환불/취소 로직을 거래 단위로 재설계
5. 프론트 결제 상태 UX 보강 및 서버 재조회 실패 케이스 정리
6. 샌드박스 end-to-end 재검증
7. 마지막으로 `d1_migrations` 상태 정상화

## 결제 확인 및 서버 연계 검증

이 섹션은 "결제 화면에서 성공처럼 보이는지"가 아니라, 실제로 **서버와 Xsolla webhook, D1 상태가 맞물려 동작하는지**를 점검하기 위한 전용 섹션이다.

### 왜 별도 관리가 필요한가

- 프론트 결제창 종료/성공 UI만으로 premium 부여 여부를 판단하면 안 된다.
- 실제 기준은 `/api/users/:uid` 응답, webhook 반영, D1 저장 상태, Xsolla 구독 상태다.
- 특히 구독형 취소는 거래 상세 화면이 아니라 Xsolla의 구독 상태(`non_renewing`)까지 확인해야 한다.

### 현재까지 확인 완료

- [x] 신규 테스트 계정으로 12개월 구독 구매 성공
- [x] 구매 후 premium 적용 및 만료일 표시 확인
- [x] 구독 취소 후 premium 즉시 회수되지 않음 확인
- [x] 구독 취소 후 `Auto-Renew Off` UI 표시 확인
- [x] `test001b@gmail.com` 기준 entitlement 반영 정상 확인
  - `entitlement_status = active`
  - `entitlement_kind = subscription`
  - `entitlement_plan = subscription_12_months`
  - `billing_reference_type = subscription_id`
  - webhook:
    - `payment`
    - `create_subscription`
    - 둘 다 `processed`
- [x] Xsolla Pay Station 내부 loyalty 조회 `400` 관찰
  - 콘솔:
    - `GET https://loyalty-points.xsolla.com/loyalty?... 400 (Bad Request)`
  - 현재 판단:
    - 결제 실패 원인 아님
    - entitlement 반영 및 premium UI 반영과는 별개
    - Xsolla 내부 optional loyalty/points lookup 실패 가능성 높음
  - Publisher Account 확인 결과:
    - `LiveOps > 로열티 프로그램` 미생성
    - `결제 > 결제 설정 > PayRank` 상에서도 loyalty/points 관련 명시 설정 미확인
  - 대응:
    - Known issue로 기록
    - 필요 시 `결제 > 결제 인터페이스` 1회 추가 점검
    - 계속 재현되면 Xsolla 지원 문의 후보
- [x] 로컬 fallback 복귀 URL 이슈 원인 확인
  - 원인:
    - checkout token 생성 시 `Origin: http://localhost:5173`
    - Xsolla return URL이 `http://localhost:5173/profile?tab=pass...` 로 설정됨
    - 당시 로컬 Vite 서버가 꺼져 있어 “사이트에 연결할 수 없음” 발생
  - 조치:
    - 로컬 Vite 서버 재실행
    - 동일 URL 재오픈 가능 확인

### 서버 연계 기준 합격선

- [ ] `/api/users/:uid` 응답 기준
  - 구매 직후:
    - `entitlement_status = active`
    - `entitlement_plan = subscription_3_months | subscription_12_months`
    - `entitlement_end = 미래 시각`
  - 구독 취소 직후:
    - `entitlement_status = non_renewing`
    - `entitlement_end = 기존 미래 시각 유지`
    - `entitlement_plan` 유지
- [ ] D1 저장 상태 기준
  - `users.billing_reference_type = subscription_id | transaction_id` 가 정상 저장되는지 확인
  - 신규 구독 계정 기준 `entitlement_end` 와 entitlement 상태가 webhook 후 업데이트되는지 확인
- [ ] Xsolla 상태 기준
  - 거래 상세는 `완료됨`으로 남아도 무방
  - 실제 확인 대상은 구독 상태
  - 구독 취소 후 `non_renewing` 으로 바뀌는지 확인
- [ ] 프론트 오판 방지 기준
  - 결제창 성공/종료만으로 premium이 붙지 않는지 확인
  - 서버 재조회 없이는 UI가 premium 완료로 확정되지 않도록 확인

### 실결선 검증 전 baseline

- [x] 원격 D1 entitlement baseline 확인
  - `total_users = 69`
  - `active_users = 0`
  - `non_renewing_users = 0`
- [ ] 결제 테스트용 신규 계정 1개 준비
- [ ] 결제 전 `/api/users/:uid` 응답이 아래와 같은지 확인
  - `entitlement_status = inactive`
  - `entitlement_kind = null`
  - `entitlement_plan = null`
  - `billing_reference_id = null`
  - `billing_reference_type = null`

### 실결선 검증 SQL

- baseline / 사후 조회

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

- 전체 카운트 확인

```sql
SELECT
  COUNT(*) AS total_users,
  SUM(CASE WHEN entitlement_status = 'active' THEN 1 ELSE 0 END) AS active_users,
  SUM(CASE WHEN entitlement_status = 'non_renewing' THEN 1 ELSE 0 END) AS non_renewing_users
FROM users;
```

- 최근 활성 entitlement 샘플 확인

```sql
SELECT
  uid,
  entitlement_status,
  entitlement_kind,
  entitlement_plan,
  entitlement_end,
  billing_reference_id,
  billing_reference_type
FROM users
WHERE entitlement_status != 'inactive'
ORDER BY entitlement_end DESC
LIMIT 10;
```

### 샌드박스 구독 검증 순서

1. 신규 테스트 계정 로그인
2. 프로필에서 구독형 상품 노출 확인
3. 결제 시작 전 `/api/users/:uid` 에서 `inactive` 상태 확인
4. 샌드박스 결제 완료
5. webhook 반영 후 `/api/users/:uid` 재조회
6. 아래가 모두 맞는지 확인
   - `entitlement_status = active`
   - `entitlement_kind = subscription`
   - `entitlement_plan = subscription_3_months | subscription_12_months`
   - `billing_reference_type = subscription_id`
   - `billing_reference_id IS NOT NULL`
7. 서비스 내 구독 취소 실행
8. `/api/users/:uid` 재조회 후 아래 확인
   - `entitlement_status = non_renewing`
   - `entitlement_kind = subscription`
   - `entitlement_plan` 유지
   - `entitlement_end` 유지
9. Xsolla에서 해당 subscription 상태가 `non_renewing` 인지 확인

### 샌드박스 이용권 검증 순서

1. 개발도상국 노출 조건 계정/환경으로 duration 상품 노출 확인
2. 결제 시작 전 `/api/users/:uid` 가 `inactive` 인지 확인
3. 샌드박스 결제 완료
4. webhook 반영 후 `/api/users/:uid` 재조회
5. 아래가 모두 맞는지 확인
   - `entitlement_status = active`
   - `entitlement_kind = duration`
   - `entitlement_plan = duration_3_months | duration_12_months`
   - `billing_reference_type = transaction_id`
   - `billing_reference_id IS NOT NULL`
6. 동일 계정에서 구매 버튼이 숨겨지는지 확인
7. refund 또는 `order_canceled` webhook 테스트 시 아래 확인
   - 같은 `transaction_id`면 entitlement 회수
   - 다른 `transaction_id`면 entitlement 유지

### 다음 세션에서 이어서 확인할 것

1. 신규 계정으로 구독 구매
2. `/api/users/:uid` 응답에서 premium 필드 확인
3. 구독 취소
4. `/api/users/:uid` 재조회 후 premium 유지 확인
5. Xsolla에서 해당 구독 상태가 `non_renewing` 인지 확인
6. 위 5개가 모두 맞으면 구독형 취소 검증 완료로 체크

## 전체 단계

### Phase 0. 준비 및 의사결정

- [x] 샌드박스 모드 우선 적용 결정
- [x] 상품 구조 1차 확정
  - 선진국 노출:
    - `subscription_3_months`
    - `subscription_12_months`
  - 개발도상국/저소득 국가 노출:
    - `duration_3_months`
    - `duration_12_months`
- [x] 국가군별 상품 노출 정책 1차 확정
  - 선진국: 구독형 상품 노출
  - 개발도상국/저소득 국가: 기간형 이용권 노출
- [x] 앱 내부 상품 카탈로그/국가군 정책 분리 시작
- [x] Xsolla 상품 타입 확정
  - 선진국 2종: `Regular subscription`
  - 개발도상국/저소득 국가 2종: `One-time item`
- [x] Xsolla 프로젝트 기본값 확보
  - [x] `merchant_id`
    - 확보값: `876936`
  - [x] `project_id`
    - 확보값: `303877`
  - [x] `api_key`
    - 확보 완료
  - [x] `webhook secret`
    - webhook URL `https://api.grogrojello.com/api/xsolla/webhook` 기준 생성/확보 완료
- [x] 국가군 목록 최종 승인
  - 선진국:
    - 미국 `US`
    - 영국 `GB`
    - 스페인 `ES`
    - 포르투갈 `PT`
    - 프랑스 `FR`
    - 한국 `KR`
    - 일본 `JP`
  - 개발도상국:
    - 베트남 `VN`
    - 인도네시아 `ID`
- [ ] 샌드박스 테스트 범위 확정
  - 신규 결제
  - 활성 구독 연장
  - 결제 실패
  - 취소/환불 이벤트
  - 중복 웹훅 재전송

### Phase 1. 서버 구조 전환

- [x] 기존 `/purchase`의 즉시 지급 로직 제거
- [x] 기존 `/cancel`의 임시 테스트 해지 fallback 제거 시작
- [x] 레거시 결제 흐름 초기화 방안 확정
  - D1에서 `subscription_plan IN ('3_months', '12_months')` 대상 계정을 legacy 테스트 데이터로 간주
  - 대상 row는 `entitlement_status = inactive`, `entitlement_plan = NULL`, `entitlement_end = 0`, `billing_reference_id = NULL`, `billing_reference_type = NULL` 상태로 정리
- [x] 원격 D1 legacy row 실제 정리 완료
  - 직접 SQL 실행 결과:
    - legacy row 22건 초기화
    - 재조회 결과 `legacy_count = 0`
- [x] 원격 D1 event ledger 실제 반영 완료
  - 대상 테이블:
    - `xsolla_webhook_events`
  - 확인 결과:
    - `sqlite_master` 재조회 시 테이블 존재 확인
- [x] Xsolla 전용 신규 결제 흐름 설계
- [x] 신규 endpoint 경로 확정
- [-] Xsolla 결제 토큰 발급 endpoint 추가
  - 현재 상태:
    - 라우팅 추가
    - 실제 Xsolla 토큰 호출 구현 완료
    - Worker secret/env 값 입력 완료
- [-] 서버 내부 plan 매핑 고정
  - 현재 상태:
    - 내부 상품 ID 4종 -> Xsolla plan env key 매핑 추가
    - 실제 Xsolla plan ID/SKU 값 Worker secret 등록 완료
- [x] 샌드박스 모드 강제
- [x] 결제창 오픈용 응답 포맷 정의
- [-] 프론트 redirect/callback URL 설계
  - 현재 기본 동작:
    - `XSOLLA_RETURN_URL`가 있으면 해당 값 사용
    - 없으면 허용된 요청 origin 기준 `.../profile?tab=pass` 사용
    - 둘 다 없으면 fallback으로 `https://www.grogrojello.com/profile?tab=pass`
  - 운영 전환 시 env 분리형 return URL 구조로 정리 필요

### Phase 2. 웹훅 검증 및 권한 반영

- [x] Xsolla 웹훅 endpoint 추가
- [x] raw body 기반 서명 검증 구현
- [-] 허용 event 타입 정의
  - 현재 반영:
    - `user_validation`
    - `create_subscription`
    - `update_subscription`
    - `cancel_subscription`
    - `order_paid`
- [ ] 웹훅 멱등 처리 구현
- [x] 웹훅 멱등 처리 1차 구현
- [-] 검증 성공 시에만 DB entitlement 반영
  - 현재 반영:
    - 구독 생성/갱신/취소
    - 1회성 기간 이용권 구매
- [ ] 실패/중복/알 수 없는 이벤트 로깅
- [ ] webhook fingerprint 기준 확정
  - 후보:
    - subscription 계열: `notification_type + subscription_id + date_end/date_next_charge`
    - duration 계열: `notification_type + transaction_id + sku`

### Phase 3. 데이터 모델 및 추적성 보강

- [x] webhook event ledger 테이블 추가
- [x] entitlement 상태 컬럼 통합 설계 확정
- [x] refund/order_canceled를 현재 entitlement reference 매칭 방식으로 보강
- [x] 원격 D1 `users` 테이블을 entitlement 스키마로 교체
- [ ] 구독 상태 변경 이력 저장
- [ ] 테스트 데이터와 운영 데이터 구분 전략 수립
- [ ] 원격 D1 반영 후 프론트/백엔드 실결선 재검증

### 레거시 D1 정리 SQL

레거시 테스트 계정 정리는 **구형 billing schema 기준으로 이미 실행 완료**했습니다. 아래 SQL은 당시 실행 기준을 기록용으로 남긴 것입니다.

- 조회 SQL

```sql
SELECT
  uid,
  email,
  is_premium,
  subscription_end,
  subscription_plan,
  xsolla_subscription_id,
  xsolla_transaction_id
FROM users
WHERE subscription_plan IN ('3_months', '12_months');
```

- 초기화 SQL

```sql
UPDATE users
SET
  is_premium = 0,
  subscription_end = 0,
  subscription_plan = NULL,
  xsolla_subscription_id = NULL,
  xsolla_transaction_id = NULL
WHERE subscription_plan IN ('3_months', '12_months');
```

- 반영 파일
  - `backend/api-grogrojello/migrations/2026-04-25_clear_legacy_subscription_plans.sql`

### D1 migration history 이슈

- 현재 원격 D1는 실제 테이블/컬럼은 존재하지만 `d1_migrations` 기록이 비어 있거나 불완전하다.
- 확인된 현상:
  - `wrangler d1 migrations apply --remote` 실행 시
  - `2026-02-13_add_subscription_columns.sql`
  - `duplicate column name: is_premium`
  - 에러로 중단
- 현재 결론:
  - 결제 안정화 작업을 먼저 진행
  - 필요한 새 스키마는 직접 SQL로 반영해 운영 불일치를 막는다
  - 이후 별도 작업으로 migration history baseline을 맞춘다

### Phase 4. 프론트 연동

- [-] `purchasePlan()` 흐름을 토큰 발급 기반으로 변경
- [x] 샌드박스 Pay Station 열기
- [-] 결제 중 UI 상태 처리
- [-] 결제 종료 후 상태 재조회
- [-] 실패/취소 UX 처리
  - 현재 반영:
    - 기존 탭 이동 제거
    - full-screen iframe 오버레이 결제 UI
    - 결제 준비 중 로딩 오버레이
    - 중복 클릭 방지
    - 닫기 버튼 및 Escape 종료

### Phase 5. 검증

- [-] 샌드박스 결제 성공 테스트
  - 현재 상태:
    - 신규 테스트 계정 구매/취소 UI 시나리오 1차 확인
    - 서버/D1/Xsolla 상태 교차검증은 별도 `결제 확인 및 서버 연계 검증` 섹션에서 계속 진행
- [ ] 결제 실패 테스트
- [ ] 웹훅 서명 불일치 테스트
- [ ] 웹훅 중복 전송 테스트
- [x] 거래 기록/멱등 처리 추가 후 duplicate `order_paid` 재전송 테스트 통과
- [x] duplicate `create_subscription` 재전송 테스트 통과
- [x] duplicate `update_subscription` 재전송 테스트 통과
- [x] duplicate `cancel_subscription` 재전송 테스트 통과
- [x] duplicate `non_renewal_subscription` 재전송 테스트 통과
- [x] duplicate `refund` 재전송 테스트 통과
- [ ] fingerprint 충돌 가능성 검토 및 보강 필요
- [ ] 비로그인/타 UID 요청 차단 테스트
- [ ] planId 변조 테스트
- [ ] 프론트 성공 콜백만으로 premium 부여 안 되는지 검증

### Phase 6. 운영 전환 준비

- [-] 샌드박스 URL 제거 계획
- [-] 운영용 Xsolla 설정값 분리
- [ ] 운영 webhook endpoint 확인
- [ ] 모니터링 항목 정리
- [ ] 장애 대응 절차 문서화
- [ ] migration history 정상화 후 운영 배포 경로 재검증

### Phase 6-A. 환경 분리 구조 보강

- [ ] Xsolla environment mode를 env 기반으로 분리
  - 예시:
    - `XSOLLA_ENV=sandbox|production`
- [ ] Pay Station base URL을 env 기반으로 분리
  - 예시:
    - sandbox: `https://sandbox-secure.xsolla.com/paystation4/`
    - production: `https://secure.xsolla.com/paystation4/`
- [ ] return URL을 env 기반으로 분리
  - 예시:
    - `XSOLLA_RETURN_URL`
- [ ] webhook secret을 환경별로 분리
  - 예시:
    - sandbox: `XSOLLA_WEBHOOK_SECRET`
    - production: 운영 Worker secret 별도 등록
- [ ] project/merchant/api key를 환경별로 분리
  - 예시:
    - sandbox values
    - production values
- [ ] plan_id / sku 매핑을 환경별로 분리
  - 예시:
    - sandbox plan ids
    - production plan ids
- [ ] 코드에서 sandbox 전용 하드코딩 제거
- [ ] 운영 전환 절차를 "코드 수정 없이 env 교체 + 배포" 형태로 문서화

## 사용자 할 일

### 계정 및 Xsolla 콘솔

- [ ] Xsolla 프로젝트의 샌드박스 사용 가능 상태 확인
- [x] 판매할 상품/구독 플랜 생성
- [x] 실제 사용할 상품 구성 확정
- [x] webhook secret 확인
  - webhook URL:
    - `https://api.grogrojello.com/api/xsolla/webhook`
- [ ] 샌드박스 테스트 카드/결제 시나리오 확인

### 인프라 및 비밀값

- [x] Cloudflare Worker secret 등록
  - `XSOLLA_MERCHANT_ID`
  - `XSOLLA_PROJECT_ID`
  - `XSOLLA_API_KEY`
  - `XSOLLA_WEBHOOK_SECRET`
  - `XSOLLA_REGULAR_SUBSCRIPTION_3_MONTHS_PLAN_ID`
  - `XSOLLA_REGULAR_SUBSCRIPTION_12_MONTHS_PLAN_ID`
  - `XSOLLA_DURATION_3_MONTHS_SKU`
  - `XSOLLA_DURATION_12_MONTHS_SKU`
- [-] 프론트에서 사용할 redirect URL 후보 확정
  - 현재 사용 중:
    - `XSOLLA_RETURN_URL` 우선
    - 미설정 시 현재 허용 origin + `/profile?tab=pass`
    - 최종 fallback: `https://www.grogrojello.com/profile?tab=pass`
  - 추후 환경별 `XSOLLA_RETURN_URL` 로 완전 고정 가능
- [-] 운영과 샌드박스 값을 혼동하지 않도록 환경 분리 원칙 확정
  - 원칙:
    - 코드 수정 없이 env/secret 교체만으로 운영 전환 가능해야 함
    - sandbox/production plan id, sku, project, merchant, webhook secret, return url 분리
  - 현재 반영:
    - `XSOLLA_ENV=sandbox|production`
    - checkout base URL env 연동
    - subscription token mode / catalog sandbox flag env 연동

### 정책 및 제품 결정

- [ ] 플랜별 가격/통화 확정
- [ ] 결제 성공 후 부여할 권한 범위 확정
- [ ] 취소/환불 시 권한 회수 정책 확정
- [ ] 고객 지원 시 확인할 관리자 기준 정보 확정
- [x] 국가군 seed list 검토 및 확정
  - 확정 반영 파일:
    - `src/constants/billingPlans.ts`

### 배포 및 실검증

- [ ] Worker 마이그레이션 적용 승인
- [x] Worker 배포 실행 또는 배포 승인
- [x] Xsolla 콘솔 webhook URL 실제 등록
- [-] 샌드박스 실결제 테스트 실행
  - 현재 상태:
    - 신규 계정 기반 구독 구매/구독 취소/취소 후 UI 상태 확인
    - 이용권 환불은 아직 범위 밖
- [-] 결과 스크린샷 또는 로그 확인
  - 현재 확보:
    - 구독 취소 후 `Auto-Renew Off` 상태 화면
    - localhost return URL 실패 원인 추적 결과
  - 추가 필요:
    - `/api/users/:uid` 응답 캡처
    - Xsolla 구독 상태(`non_renewing`) 캡처

## 내가 처리할 일

### 백엔드

- [-] 현재 `/purchase` 구조를 Xsolla 토큰 발급 방식으로 교체
  - 신규 Xsolla 경로 구현 완료
  - 기존 레거시 `/purchase` 직접지급 차단 완료
- [x] planId 화이트리스트 및 서버 고정 매핑 추가
- [x] Xsolla 샌드박스 토큰 발급 호출 구현
- [x] 웹훅 endpoint 및 서명 검증 구현
- [-] Xsolla 토큰 요청 payload 보정
  - 현재 반영:
    - subscription token request에 `project_id`, env 기반 `mode` 반영
    - Xsolla 콘솔 옵션과 충돌하는 `settings.external_id` 제거
- [ ] 거래 멱등 처리 구현
- [-] 프리미엄 반영 로직을 웹훅 성공 기준으로 이동
  - 기본 반영 완료
  - 거래 로그/멱등 처리 보강 필요

### 데이터 및 보안

- [ ] 거래 기록용 D1 스키마 초안 작성
- [x] 거래 기록 테이블 기준 unique key 1차 전략 반영
  - `subscription`: `notification_type + subscription_id + date`
  - `duration`: `notification_type + transaction_id + product_id`
- [ ] replay 공격/지연 재전송에 대한 fingerprint 강건성 재검토
- [ ] 위변조 방지 체크 추가
- [ ] 민감값 노출 경계 검토
- [ ] 에러/보안 이벤트 로그 포인트 정리
- [ ] 실패 시 롤백 또는 무시 기준 정리
- [ ] `d1_migrations` 정상화 계획 수립

### 프론트엔드

- [x] `src/services/syncService.ts` 결제 API 흐름 수정
- [x] `useNurturingSync.ts` 구매 완료 처리 구조 수정
- [x] 결제창 오픈 유틸 추가
- [-] 결제 대기/실패/취소 UI 상태 연결
- [-] 결제 후 서버 상태 재동기화 처리
  - 현재 반영:
    - full-screen iframe overlay
    - localized checkout header title
    - service-wide loading overlay reuse
    - purchase button disable during checkout preparation/open

### 문서 및 진행 관리

- [x] 단계별 통합 체크리스트 문서 생성
- [x] 구현 시작 시 현재 진행 상태 갱신
- [ ] 각 단계 완료 때마다 체크박스 업데이트
- [ ] 최종 검증 결과와 잔여 리스크 기록

## Phase 0 결정 사항

### 상품 구조

현재 1차 상품 구조는 아래 4종으로 고정합니다.

| 내부 상품 ID | 노출 대상 | 성격 | 기간 |
|------|------|------|------|
| `subscription_3_months` | 주요 선진국 | 구독형 | 3개월 |
| `subscription_12_months` | 주요 선진국 | 구독형 | 12개월 |
| `duration_3_months` | 개발도상국/저소득 국가 | 기간형 이용권 | 3개월 |
| `duration_12_months` | 개발도상국/저소득 국가 | 기간형 이용권 | 12개월 |

### Xsolla 상품 타입 매핑

| 내부 상품 ID | Xsolla 타입 |
|------|------|
| `subscription_3_months` | `Regular subscription` |
| `subscription_12_months` | `Regular subscription` |
| `duration_3_months` | `One-time item` |
| `duration_12_months` | `One-time item` |

### Xsolla 플랜 생성 시 권장 입력값

| 내부 상품 ID | Xsolla 타입 | Plan name | Description |
|------|------|------|------|
| `subscription_3_months` | `Regular subscription` | `Quarterly Jello Pass` | `Premium access for 3 months with recurring billing.` |
| `subscription_12_months` | `Regular subscription` | `Annual Angel Pass` | `Premium access for 12 months with recurring billing.` |
| `duration_3_months` | `One-time item` | `3-Month Jello Pass` | `One-time premium access for 3 months.` |
| `duration_12_months` | `One-time item` | `12-Month Angel Pass` | `One-time premium access for 12 months.` |

### 1회성 기간 이용권 최종 입력값

#### `duration_3_months`

- 타입: `One-time item`
- SKU: `duration_3_months`
- Item name: `3-Month Jello Pass`
- Description: `One-time premium access for 3 months.`
- Price: `USD 3.99`
- Purchase limit per user: `1`
- Store display: `Always`
- JSON:

```json
{
  "internal_product_id": "duration_3_months",
  "access_type": "one_time_duration",
  "duration_months": 3,
  "premium_entitlement": true
}
```

#### `duration_12_months`

- 타입: `One-time item`
- SKU: `duration_12_months`
- Item name: `12-Month Angel Pass`
- Description: `One-time premium access for 12 months.`
- Price: `USD 12.00`
- Purchase limit per user: `1`
- Store display: `Always`
- JSON:

```json
{
  "internal_product_id": "duration_12_months",
  "access_type": "one_time_duration",
  "duration_months": 12,
  "premium_entitlement": true
}
```

### 상품 생성 시 입력 원칙

- Xsolla `Plan name` 은 서비스/결제 UI에 노출될 수 있으므로 사용자 노출용 이름으로 작성합니다.
- 내부 코드명(`subscription_3_months` 등)은 Xsolla `Plan name` 칸에 직접 넣지 않습니다.
- 내부 코드명은 우리 서버/프론트 매핑에서 별도로 관리합니다.
- 각 상품 생성 후 아래 정보를 함께 기록합니다.
  - `internal product id`
  - `xsolla product name`
  - 정기결제면 `plan_id`
  - 1회성 아이템이면 `sku`

### 상품 생성 후 기록 형식

```text
internal: subscription_3_months
plan_name: Quarterly Jello Pass
plan_id: ...

internal: subscription_12_months
plan_name: Annual Angel Pass
plan_id: ...

internal: duration_3_months
plan_name: 3-Month Jello Pass
sku: ...

internal: duration_12_months
plan_name: 12-Month Angel Pass
sku: ...
```

### 앱 내부 정책

- 현재 앱은 실제 billing country를 아직 받지 않으므로, 우선 아래 구조로 시작합니다.
- 1차 판별:
  - 명시적 국가 코드가 있으면 국가군 정책 사용
- 확정 국가군:
  - 선진국:
    - 미국 `US`
    - 영국 `GB`
    - 스페인 `ES`
    - 포르투갈 `PT`
    - 프랑스 `FR`
    - 한국 `KR`
    - 일본 `JP`
  - 개발도상국:
    - 베트남 `VN`
    - 인도네시아 `ID`
- fallback:
  - `id`, `id-ID`, `vi`, `vi-VN` 은 기간형
  - 그 외는 기본적으로 구독형
- 이 fallback은 임시 장치이며, 실제 Xsolla/결제 국가 기준 연결 전까지만 사용합니다.

### 코드 반영 위치

- 상품/국가군 정책 상수:
  - `src/constants/billingPlans.ts`
- Profile 페이지 노출 분기:
  - `src/pages/ProfilePage.tsx`

## Phase 1 설계 초안

### 목표

- 레거시 `/purchase`, `/cancel` 즉시 반영 구조를 폐기한다.
- Xsolla 전용 endpoint를 별도로 둔다.
- 사용자 인증과 결제 검증의 책임을 분리한다.
- premium 부여는 webhook 성공 처리에서만 수행한다.

### 제안 endpoint

#### 1. 결제 토큰 발급

- 경로:
  - `POST /api/users/:uid/xsolla/checkout-token`
- 인증:
  - Firebase ID Token 필요
- 입력:
  - `productId`
    - `subscription_3_months`
    - `subscription_12_months`
    - `duration_3_months`
    - `duration_12_months`
- 서버 처리:
  - `uid` 와 Firebase `claims.sub` 일치 검증
  - `productId` 화이트리스트 검증
  - 국가군/상품 노출 정책과 요청 상품의 정합성 검증
  - 내부 상품 -> Xsolla 상품/플랜 ID 매핑
  - 샌드박스 모드 강제
  - Xsolla payment token 생성 호출
- 응답:
  - `token`
  - `checkoutUrl`
  - `productId`
  - `sandbox: true`

#### 2. 웹훅 수신

- 경로:
  - `POST /api/xsolla/webhook`
- 인증:
  - Firebase 인증 없음
  - Xsolla webhook 서명 검증 필수
- 서버 처리:
  - raw body 보존
  - `Authorization` 헤더 기반 서명 검증
  - event 타입 검증
  - transaction 멱등 처리
  - 결제 성공/구독 활성화 시 premium 반영
  - 취소/환불/만료 정책 반영

#### 3. 결제 상태 재조회

- 경로:
  - 기존 `GET /api/users/:uid` 재사용 우선
- 용도:
  - 프론트는 checkout 종료 후 서버의 subscription 상태를 다시 조회
  - 프론트 성공 콜백만으로 premium 반영 금지

### 레거시 경로 처리

- `POST /api/users/:uid/purchase`
  - 새 구조가 붙으면 제거 또는 항상 실패 응답으로 전환
- `POST /api/users/:uid/cancel`
  - Xsolla 타입별 정책 확정 후 교체
  - 적어도 즉시 상태 반영용 테스트 경로로는 남기지 않음

### 상품 ID와 서버 매핑

프론트/서버 공통 내부 상품 ID는 아래 4종으로 유지합니다.

- `subscription_3_months`
- `subscription_12_months`
- `duration_3_months`
- `duration_12_months`

서버는 이 내부 상품 ID만 신뢰하고, 가격/기간/Xsolla plan 또는 item 코드는 서버 내부 매핑으로만 결정합니다.

### webhook 최종 URL

현재 구현 기준 경로:

- `https://api.grogrojello.com/api/xsolla/webhook`

이 URL은 이제 실제 webhook 등록 대상으로 사용 가능합니다.

### 현재 구현 상태

- Worker에 아래 신규 경로가 추가되었습니다.
  - `POST /api/users/:uid/xsolla/checkout-token`
  - `POST /api/xsolla/webhook`
- 현재 상태:
  - `checkout-token`: 실제 Xsolla 토큰 요청 구현 완료
  - `webhook`: 서명 검증 + 기본 권한 반영 구현 완료
- 대신 아래를 보장합니다.
  - 인증/경로/입력 검증
  - 설정 누락 시 안전한 실패 응답
  - 레거시 `/purchase` 구조와 충돌 없이 신규 진입점 확보

### 상품 매핑 env 키

실제 Xsolla 상품 연결 시 Worker secret 또는 환경값으로 아래 키가 필요합니다.

- `XSOLLA_REGULAR_SUBSCRIPTION_3_MONTHS_PLAN_ID`
- `XSOLLA_REGULAR_SUBSCRIPTION_12_MONTHS_PLAN_ID`
- `XSOLLA_DURATION_3_MONTHS_SKU`
- `XSOLLA_DURATION_12_MONTHS_SKU`

### 현재 확보된 식별자

- 정기결제:
  - `subscription_3_months`
    - `plan_id: WZ401Sj5`
  - `subscription_12_months`
    - `plan_id: l9rHf8au`
- 1회성 아이템:
  - `duration_3_months`
    - `sku: duration_3_months`
  - `duration_12_months`
    - `sku: duration_12_months`

### 레거시 결제 흐름 처리 원칙

- 기존 `POST /api/users/:uid/purchase` 와 `POST /api/users/:uid/cancel` 는 실제 운영 결제 구조로 승계하지 않습니다.
- 이 경로들은 임시 테스트용으로만 간주합니다.
- 실제 Xsolla 연동 시에는 아래 원칙으로 새로 구성합니다.
  - 서버 토큰 발급 endpoint 분리
  - Xsolla webhook 검증 endpoint 분리
  - premium 부여는 webhook 성공 후에만 반영
  - 레거시 즉시 지급 로직은 제거 또는 완전 비활성화
  - 필요 시 테스트 데이터와 레거시 subscription 상태를 초기화

## 보안 체크리스트

### 민감 정보 관리

- [x] `api_key`를 프론트 코드에 절대 노출하지 않는다
- [ ] `webhook secret`을 프론트 코드에 절대 노출하지 않는다
- [x] 토큰 발급은 서버에서만 수행한다
- [x] plan 가격/기간은 서버 고정값으로만 사용한다

### 입력 검증

- [x] `planId` 화이트리스트 검증
- [x] UID-path와 Firebase claims.sub 일치 강제 유지
- [ ] webhook event 구조 검증
- [ ] 통화/금액/상품 ID 일치 검증

### 권한 부여

- [x] 프론트 콜백만으로 premium 부여 금지
- [x] 웹훅 서명 검증 실패 시 즉시 거절
- [-] 결제 성공 event 확인 후에만 premium 부여
  - 기본 반영 완료
  - 거래 멱등 처리 보강 필요
- [ ] 취소/환불 event 처리 정책 반영

### 중복 및 재시도

- [ ] 동일 transaction 중복 처리 방지
- [ ] 동일 webhook 재전송 멱등 처리
- [ ] 네트워크 실패 시 부분 반영 방지

### 감사 추적

- [ ] transaction 로그 저장
- [ ] uid, planId, amount, currency, eventType 기록
- [ ] 보안 실패 로그 저장
- [ ] 수동 조사 가능한 수준의 payload 보존 정책 수립

## 권장 구현 순서

1. 거래 기록 테이블 설계 및 추가
2. 웹훅 멱등 처리 추가
3. 실패/중복/알 수 없는 이벤트 로깅 추가
4. 기간형 refund/cancel 정책을 거래 단위 구조로 재설계
5. 프론트 결제 상태 확정 UX 보강
6. 샌드박스 시나리오 재검증
7. 마지막으로 `d1_migrations` 정상화

## 진행 로그

### 2026-04-24

- [x] 샌드박스 모드 우선 적용 결정
- [x] 현재 코드베이스의 결제 관련 진입점 조사
- [x] 현재 `/purchase`가 실결제 검증 없이 premium을 부여하는 구조임을 확인
- [x] Xsolla 샌드박스 연동 체크리스트 문서 생성
- [x] 4개 상품 구조와 국가군별 노출 정책 1차 확정
- [x] Xsolla 상품 타입 결정
  - 선진국: `Regular subscription`
  - 개발도상국/저소득 국가: `One-time item`
- [x] 지원 언어 기준 국가군 최종 확정
  - 선진국: `US`, `GB`, `ES`, `PT`, `FR`, `KR`, `JP`
  - 개발도상국: `VN`, `ID`
- [x] Xsolla 기본값 일부 확보
  - `merchant_id = 876936`
  - `project_id = 303877`
  - `api_key` 확보 완료
  - `webhook secret` 은 최종 webhook URL 확정 후 진행
- [x] Xsolla 상품 4종 생성 완료
  - 정기결제:
    - `subscription_3_months`
    - `subscription_12_months`
  - 1회성 기간 이용권:
    - `duration_3_months`
    - `duration_12_months`
- [x] 앱 내부 상품 카탈로그/국가군 정책 상수 파일 추가
- [x] Profile 페이지의 임시 로케일 분기를 상품 정책 상수 기반으로 정리
- [x] 레거시 `/purchase`, `/cancel` 흐름은 폐기 전제의 임시 테스트용임을 명시
- [x] Phase 1 신규 Xsolla 결제 흐름 endpoint 구조 초안 작성
- [x] Worker에 Xsolla 신규 경로 뼈대 추가
  - `POST /api/users/:uid/xsolla/checkout-token`
  - `POST /api/xsolla/webhook`
- [x] 서버 내부 상품 ID -> Xsolla plan/item env key 매핑 구조 추가
- [x] 신규 경로 테스트 추가 및 통과
- [x] Xsolla checkout token 실제 호출 구현
- [x] Xsolla webhook 서명 검증 및 기본 권한 반영 구현
- [ ] 다음 작업: Worker secret 등록, webhook 등록, 프론트 연동, 실제 sandbox end-to-end 테스트

### 2026-04-25

- [x] 프론트/백엔드 레거시 `3_months` / `12_months` 호환 분기 제거 시작
- [x] 원격 D1에서 legacy `subscription_plan` row 조회
  - 조회 결과: 22건
- [x] 원격 D1에서 legacy `subscription_plan` row 초기화
  - 대상:
    - `3_months`
    - `12_months`
  - 결과:
    - 22 rows written
    - 재조회 결과 `legacy_count = 0`
- [x] `wrangler whoami`, `wrangler d1 list`, 원격 schema 조회로 계정/DB 연결 확인
- [x] `d1_migrations` 불일치 확인
  - migration apply 시 duplicate column 에러 발생
  - 이후 별도 baseline 정상화 필요
- [x] 남은 최우선 작업을 `거래 기록 + 멱등 처리`로 재설정
- [x] 최소 event ledger 테이블 `xsolla_webhook_events` 추가
- [x] webhook event fingerprint 기반 멱등 처리 1차 구현
- [x] duplicate `order_paid` webhook 재전송 테스트 추가 및 통과
- [x] duplicate `create_subscription` / `update_subscription` / `cancel_subscription` / `non_renewal_subscription` / `refund` webhook 재전송 테스트 추가 및 통과
- [x] 원격 D1에 `xsolla_webhook_events` 직접 생성
- [x] 원격 D1에서 `xsolla_webhook_events` 존재 재검증 완료
- [x] backend worker tests 통과
  - `34 passed`

## 지금 시점의 사용자 할 일

### 지금 바로 해야 하는 것

1. Xsolla에서 아래 4개 상품을 준비합니다.
   - 정기결제 플랜:
     - `subscription_3_months`
     - `subscription_12_months`
   - 1회성 아이템:
     - `duration_3_months`
     - `duration_12_months`
2. 각 상품의 실제 Xsolla 식별자를 정리합니다.
   - 정기결제 2종:
     - `plan_id`
   - 1회성 아이템 2종:
     - `sku`
3. 샌드박스 테스트 카드/결제 시나리오를 확인합니다.
4. Cloudflare Worker에 아래 secret/env 값을 등록합니다.
   - `XSOLLA_MERCHANT_ID`
   - `XSOLLA_PROJECT_ID`
   - `XSOLLA_API_KEY`
   - `XSOLLA_WEBHOOK_SECRET`
   - `XSOLLA_REGULAR_SUBSCRIPTION_3_MONTHS_PLAN_ID`
   - `XSOLLA_REGULAR_SUBSCRIPTION_12_MONTHS_PLAN_ID`
   - `XSOLLA_DURATION_3_MONTHS_SKU`
   - `XSOLLA_DURATION_12_MONTHS_SKU`
5. Xsolla Webhooks에 최종 URL을 등록합니다.
   - `https://api.grogrojello.com/api/xsolla/webhook`
6. Webhooks 화면에서 `webhook secret`을 확인/생성합니다.

### 상품 생성 시 사용자 입력 체크리스트

- [x] `subscription_3_months`
  - 타입: `Regular subscription`
  - Plan name: `Quarterly Jello Pass`
  - Description: `Premium access for 3 months with recurring billing.`
- [x] `subscription_12_months`
  - 타입: `Regular subscription`
  - Plan name: `Annual Angel Pass`
  - Description: `Premium access for 12 months with recurring billing.`
- [x] `duration_3_months`
  - 타입: `One-time item`
  - Plan name: `3-Month Jello Pass`
  - Description: `One-time premium access for 3 months.`
- [x] `duration_12_months`
  - 타입: `One-time item`
  - Plan name: `12-Month Angel Pass`
  - Description: `One-time premium access for 12 months.`
- [ ] 정기결제 2종의 `plan_id` 기록
- [ ] 1회성 아이템 2종의 `sku` 기록

### 아직 하지 말아야 하는 것

1. 프론트 결제 버튼을 바로 실테스트하지 않습니다.
2. Worker secret 등록 전 webhook 테스트를 먼저 돌리지 않습니다.
3. 거래 로그/멱등 처리 없이 운영 전환을 하지 않습니다.

### 내가 endpoint 구현 후 네가 할 것

1. Xsolla Webhooks에 `https://api.grogrojello.com/api/xsolla/webhook` 입력
2. 그 화면에서 활성 secret key를 확인하거나 생성
3. `XSOLLA_WEBHOOK_SECRET` 으로 Worker secret에 등록
4. 내가 프론트 연동을 마친 뒤 샌드박스 결제 시나리오 테스트 실행

## 다음 세션 인계

### 현재 완료

- 4개 상품 생성 완료
- 식별자 확보 완료
  - `subscription_3_months` → `WZ401Sj5`
  - `subscription_12_months` → `l9rHf8au`
  - `duration_3_months` → `duration_3_months`
  - `duration_12_months` → `duration_12_months`
- Worker backend 구현 완료
  - checkout token route
  - webhook route
  - signature verification
  - 기본 premium 반영
- Xsolla webhook URL 등록 완료
  - `https://api.grogrojello.com/api/xsolla/webhook`
- Xsolla webhook secret 생성 및 확보 완료
- Cloudflare Worker secret 등록 완료
  - `XSOLLA_MERCHANT_ID`
  - `XSOLLA_PROJECT_ID`
  - `XSOLLA_API_KEY`
  - `XSOLLA_WEBHOOK_SECRET`
  - `XSOLLA_REGULAR_SUBSCRIPTION_3_MONTHS_PLAN_ID`
  - `XSOLLA_REGULAR_SUBSCRIPTION_12_MONTHS_PLAN_ID`
  - `XSOLLA_DURATION_3_MONTHS_SKU`
  - `XSOLLA_DURATION_12_MONTHS_SKU`
- Worker 배포 완료
  - worker: `api-grogrojello`
  - latest version: `47390cb9-8713-461d-85cc-2f5f8f89531c`
- 프론트 Xsolla 1차 연동 완료
  - `purchasePlan()` -> `/api/users/:uid/xsolla/checkout-token` 연결
  - Xsolla hosted checkout iframe 오버레이 연결
  - 결제 페이지 복귀 시 subscription 상태 재조회 연결
- Xsolla 결제 페이지 오픈 확인 완료
  - 기존 페이지 내 full-screen iframe 오버레이로 실제 Pay Station 진입 확인
  - 아직 샌드박스 결제 완료 검증 전
- 프론트 결제 UX 2차 보강 완료
  - 시스템 confirm 팝업 제거
  - 구매 버튼 클릭 시 즉시 결제 준비 로딩 오버레이 표시
  - 새 탭 없이 기존 페이지에서 full-screen 결제 진행
  - checkout header title 다국어 적용
- 로컬 빌드 통과
- backend tests `35 passed`

### 사용자 다음 작업

1. 신규 테스트 계정으로 구독 1회 결제/취소 검증
2. duration 노출 조건에서 이용권 1회 결제/환불 webhook 검증
3. 실패/취소 시나리오에서 entitlement 오지급/오회수 없는지 확인
4. 검증 후 결과를 체크리스트의 합격선 항목에 반영

### 다음 세션에서 내가 할 일

1. 샌드박스 구독/이용권 실결선 결과를 entitlement 기준으로 기록
2. 실패/중복 event 로깅 세분화
3. fingerprint 충돌 가능성 검토 및 필요 시 event key 보강
4. `d1_migrations` baseline 정상화 계획 수립 및 검증
5. 이후 migration apply 복구

## 관련 파일

- [src/services/syncService.ts](/Users/somniavisk/Desktop/puzzleletic/src/services/syncService.ts:405)
- [src/contexts/hooks/useNurturingSync.ts](/Users/somniavisk/Desktop/puzzleletic/src/contexts/hooks/useNurturingSync.ts:500)
- [src/constants/billingPlans.ts](/Users/somniavisk/Desktop/puzzleletic/src/constants/billingPlans.ts:1)
- [backend/api-grogrojello/src/index.js](/Users/somniavisk/Desktop/puzzleletic/backend/api-grogrojello/src/index.js:691)
- [docs/API_SECURITY_HARDENING_PLAN.md](/Users/somniavisk/Desktop/puzzleletic/docs/API_SECURITY_HARDENING_PLAN.md:1)
- [docs/HYBRID_STORAGE_ARCHITECTURE.md](/Users/somniavisk/Desktop/puzzleletic/docs/HYBRID_STORAGE_ARCHITECTURE.md:1)
