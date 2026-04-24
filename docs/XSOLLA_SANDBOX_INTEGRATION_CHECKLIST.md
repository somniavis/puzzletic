# Xsolla 샌드박스 결제 연동 체크리스트

> 마지막 업데이트: 2026-04-24
> 상태: Phase 1 백엔드 배포 및 secret 등록 완료, Phase 4 프론트 연동 진행 중

## 목적

이 문서는 `Puzzleletic`에 Xsolla 기반 결제 시스템을 **샌드박스 모드부터 안전하게** 붙이기 위한 전체 단계와 체크리스트를 정리합니다.

현재 코드베이스 기준 전제:

- 프론트엔드: `Vite + React`
- 인증: `Firebase Auth`
- 백엔드: `Cloudflare Worker + D1`
- 기존 구독 반영 경로:
  - `POST /api/users/:uid/purchase`
  - `POST /api/users/:uid/cancel`
- 현재 `/purchase`는 실제 결제 검증 없이 프리미엄을 바로 지급하는 구조이므로, Xsolla 연동 전에 반드시 교체되어야 함
- 위 기존 경로는 **임시 테스트용 레거시 흐름**으로 간주하며, 실제 Xsolla 연동 시에는 보안 기준에 맞게 새 구조로 재구성한다

## 목표

1. 샌드박스 결제 토큰 발급과 결제창 호출을 연결한다.
2. 프론트 성공 콜백이 아니라 **Xsolla 웹훅 검증 후** 프리미엄을 부여한다.
3. 가격, 권한, 구독 기간, 결제 상태를 모두 서버 기준으로 관리한다.
4. 운영 전환 전에 필요한 보안 취약점을 사전 차단한다.

## 상태 규칙

- `[ ]` 미착수
- `[-]` 진행 중
- `[x]` 완료
- `[!]` 차단 이슈 또는 사용자 확인 필요

## 현재 확인된 핵심 리스크

1. 현재 `backend/api-grogrojello/src/index.js`의 `/purchase`는 결제 검증 없이 `is_premium = 1`을 바로 반영한다.
2. 프론트에서 결제 성공처럼 보이는 상태와 실제 정산 완료 상태를 혼동하면 권한 오지급이 발생한다.
3. Xsolla API Key, webhook secret을 프론트에 노출하면 결제 위변조 가능성이 커진다.
4. 웹훅 멱등 처리가 없으면 재전송 시 중복 지급이 발생할 수 있다.
5. 별도 거래 기록 테이블이 없으면 환불, 취소, 중복 지급, 테스트 이력 추적이 어렵다.

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

- [ ] 기존 `/purchase`의 즉시 지급 로직 제거
- [ ] 기존 `/cancel`의 임시 테스트 해지 로직 제거 또는 레거시 격리
- [ ] 레거시 결제 흐름 초기화 방안 확정
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
- [ ] 샌드박스 모드 강제
- [ ] 결제창 오픈용 응답 포맷 정의
- [ ] 프론트 redirect/callback URL 설계

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
- [-] 검증 성공 시에만 DB premium 반영
  - 현재 반영:
    - 구독 생성/갱신/취소
    - 1회성 기간 이용권 구매
- [ ] 실패/중복/알 수 없는 이벤트 로깅

### Phase 3. 데이터 모델 및 추적성 보강

- [ ] 거래 기록 테이블 추가
- [ ] 구독 상태 변경 이력 저장
- [ ] 사용자-거래-플랜 매핑 필드 정리
- [ ] 테스트 데이터와 운영 데이터 구분 전략 수립

### Phase 4. 프론트 연동

- [-] `purchasePlan()` 흐름을 토큰 발급 기반으로 변경
- [-] 샌드박스 Pay Station 열기
- [ ] 결제 중 UI 상태 처리
- [-] 결제 종료 후 상태 재조회
- [ ] 실패/취소 UX 처리

### Phase 5. 검증

- [ ] 샌드박스 결제 성공 테스트
- [ ] 결제 실패 테스트
- [ ] 웹훅 서명 불일치 테스트
- [ ] 웹훅 중복 전송 테스트
- [ ] 비로그인/타 UID 요청 차단 테스트
- [ ] planId 변조 테스트
- [ ] 프론트 성공 콜백만으로 premium 부여 안 되는지 검증

### Phase 6. 운영 전환 준비

- [ ] 샌드박스 URL 제거 계획
- [ ] 운영용 Xsolla 설정값 분리
- [ ] 운영 webhook endpoint 확인
- [ ] 모니터링 항목 정리
- [ ] 장애 대응 절차 문서화

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
- [ ] 프론트에서 사용할 redirect URL 후보 확정
- [ ] 운영과 샌드박스 값을 혼동하지 않도록 환경 분리 원칙 확정

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
- [ ] 샌드박스 실결제 테스트 실행
- [ ] 결과 스크린샷 또는 로그 확인

## 내가 처리할 일

### 백엔드

- [-] 현재 `/purchase` 구조를 Xsolla 토큰 발급 방식으로 교체
  - 신규 Xsolla 경로 구현 완료
  - 기존 레거시 `/purchase` 제거는 미완료
- [x] planId 화이트리스트 및 서버 고정 매핑 추가
- [x] Xsolla 샌드박스 토큰 발급 호출 구현
- [x] 웹훅 endpoint 및 서명 검증 구현
- [ ] 거래 멱등 처리 구현
- [-] 프리미엄 반영 로직을 웹훅 성공 기준으로 이동
  - 기본 반영 완료
  - 거래 로그/멱등 처리 보강 필요

### 데이터 및 보안

- [ ] 거래 기록용 D1 스키마 초안 작성
- [ ] 위변조 방지 체크 추가
- [ ] 민감값 노출 경계 검토
- [ ] 에러/보안 이벤트 로그 포인트 정리
- [ ] 실패 시 롤백 또는 무시 기준 정리

### 프론트엔드

- [x] `src/services/syncService.ts` 결제 API 흐름 수정
- [x] `useNurturingSync.ts` 구매 완료 처리 구조 수정
- [x] 결제창 오픈 유틸 추가
- [ ] 결제 대기/실패/취소 UI 상태 연결
- [-] 결제 후 서버 상태 재동기화 처리

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

1. 서버 plan 매핑과 Xsolla 토큰 발급 endpoint 추가
2. 기존 `/purchase` 즉시 지급 제거
3. 웹훅 endpoint와 서명 검증 추가
4. 거래 기록 테이블 추가
5. 프론트 결제창 오픈 연결
6. 결제 완료 후 상태 재조회 연결
7. 샌드박스 시나리오 테스트

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
  - version: `f27094a4-8392-4cef-af4b-df50ba547d39`
- 프론트 Xsolla 1차 연동 완료
  - `purchasePlan()` -> `/api/users/:uid/xsolla/checkout-token` 연결
  - Xsolla hosted checkout URL 오픈 연결
  - 결제 페이지 복귀 시 subscription 상태 재조회 연결
- 로컬 빌드 통과
- backend tests `24 passed`

### 사용자 다음 작업

1. 샌드박스 테스트 카드/결제 시나리오 확인
2. 프론트에서 사용할 redirect URL 후보 확정
3. 샌드박스 결제 테스트 실행

### 다음 세션에서 내가 할 일

1. 결제 중/실패/취소 UX 보강
2. sandbox end-to-end 점검
3. 거래 로그 테이블/멱등 처리 보강
4. 레거시 `/purchase` 제거 또는 격리

## 관련 파일

- [src/services/syncService.ts](/Users/somniavisk/Desktop/puzzleletic/src/services/syncService.ts:405)
- [src/contexts/hooks/useNurturingSync.ts](/Users/somniavisk/Desktop/puzzleletic/src/contexts/hooks/useNurturingSync.ts:500)
- [src/constants/billingPlans.ts](/Users/somniavisk/Desktop/puzzleletic/src/constants/billingPlans.ts:1)
- [backend/api-grogrojello/src/index.js](/Users/somniavisk/Desktop/puzzleletic/backend/api-grogrojello/src/index.js:691)
- [docs/API_SECURITY_HARDENING_PLAN.md](/Users/somniavisk/Desktop/puzzleletic/docs/API_SECURITY_HARDENING_PLAN.md:1)
- [docs/HYBRID_STORAGE_ARCHITECTURE.md](/Users/somniavisk/Desktop/puzzleletic/docs/HYBRID_STORAGE_ARCHITECTURE.md:1)
