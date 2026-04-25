# PWA Installability Plan

> 마지막 업데이트: 2026-04-26
> 범위: `Puzzleletic` 웹앱을 설치 가능한 PWA로 전환하되, 기존 서버 통신 구조는 변경하지 않는다.

## 목적

이 계획의 목표는 `Puzzleletic`를 홈 화면에 설치 가능한 PWA로 만드는 것이다. 다만 이번 범위는 어디까지나 installability와 앱형 진입 경험 개선이며, 오프라인 앱 전환이 아니다.

고정 원칙:

- 기존 서버 통신 로직은 유지한다.
- 기존 인증 흐름은 유지한다.
- 기존 결제/Xsolla 흐름은 유지한다.
- 기존 API 호출 방식은 유지한다.
- 오프라인 지원은 하지 않는다.

즉, PWA는 앱 포장 계층으로만 적용하고 데이터 진실원은 계속 서버로 둔다.

## 현재 저장소 기준 현황

확인 기준:

- 빌드 도구: `Vite`
- 프론트엔드: `React`
- 현재 `vite.config.ts` 에 PWA 플러그인 설정 없음
- 현재 `index.html` 에 manifest 연결 없음
- 현재 `public/` 에 PWA 아이콘 세트 없음
- 현재 favicon 은 `public/vite.svg` 기반

현재 판단:

- 구조가 단순해서 PWA 1차 적용은 어렵지 않다.
- 다만 인증/결제/프로필 상태는 캐시 최적화보다 안정성이 우선이다.

## 적용 원칙

### 1. Installability First

우선 목표는 아래 4가지만 달성하는 것이다.

- 브라우저가 앱 설치 가능 상태로 인식
- 홈 화면 추가 가능
- 앱 아이콘/이름/theme-color 정상 반영
- 앱처럼 standalone 실행 가능

### 2. Network Truth 유지

서비스워커를 도입하더라도 아래는 기존 네트워크 흐름을 그대로 유지한다.

- `/api/*`
- Firebase Auth 관련 요청
- Xsolla checkout 및 결제 관련 요청
- entitlement / subscription / profile 상태 확인 요청

즉, PWA가 데이터 응답을 새로 저장하거나 서버를 대체하지 않는다.

### 3. Offline Unsupported

이번 단계에서는 오프라인 동작을 지원하지 않는다.

- 오프라인 fallback 페이지를 핵심 기능처럼 설계하지 않는다.
- 설치 후에도 네트워크가 없으면 정상 기능 사용이 불가한 것이 맞다.
- 서비스워커는 offline-first 전략을 쓰지 않는다.

## 단계별 계획

## Phase 0. 준비 점검

목표:

- 현재 앱의 PWA 적용 준비 상태를 확인한다.

작업:

1. 현재 `Vite` 설정 확인
2. `index.html` 메타/아이콘 구조 확인
3. `public/` 정적 자산 구조 확인
4. 앱 이름, 짧은 이름, theme color, background color 확정
5. 설치 아이콘 원본 준비 여부 확인

산출물:

- 이 계획 문서
- 필요한 아이콘/manifest 항목 목록

리스크:

- 적절한 앱 아이콘이 없으면 설치 퀄리티가 떨어진다.

## Phase 1. Manifest 도입

목표:

- 브라우저가 앱을 installable PWA로 인식하도록 한다.

작업:

1. `public/manifest.webmanifest` 추가
2. 아래 필드 정의
   - `name`
   - `short_name`
   - `description`
   - `theme_color`
   - `background_color`
   - `display: standalone`
   - `start_url`
   - `scope`
   - `icons`
3. `index.html` 에 manifest link 추가
4. `theme-color` 메타 추가
5. 필요 시 Apple 관련 메타 추가

권장 값:

- `display`: `standalone`
- `start_url`: `/`
- `scope`: `/`

주의:

- `start_url` 을 특정 인증 페이지나 결제 페이지로 두지 않는다.
- 앱 진입점은 항상 일반 루트 또는 안정적인 landing 경로로 둔다.

완료 기준:

- Chrome DevTools Application 탭에서 manifest 인식
- 설치 버튼 노출 조건 충족

## Phase 2. 아이콘 및 브랜딩 자산 정리

목표:

- 설치된 앱이 어색하지 않도록 최소 아이콘 세트를 갖춘다.

작업:

1. PWA 아이콘 파일 준비
2. 최소 크기 추가
   - `192x192`
   - `512x512`
3. 가능하면 maskable 아이콘도 추가
4. favicon 과 manifest 아이콘 역할 분리

권장 파일 위치:

- `public/icons/icon-192.png`
- `public/icons/icon-512.png`
- `public/icons/icon-192-maskable.png`
- `public/icons/icon-512-maskable.png`

주의:

- 현재 `vite.svg` 는 개발 기본 아이콘이므로 앱 설치용 아이콘으로 적합하지 않다.

완료 기준:

- Android 설치 시 아이콘이 정상 표시
- splash/launcher 에서 기본 Vite 아이콘이 보이지 않음

## Phase 3. 서비스워커 최소 도입

목표:

- installability 요건을 안정적으로 만족시키되, 서버 통신 로직은 그대로 유지한다.

권장 구현:

- `vite-plugin-pwa` 사용

이유:

- 현재 스택이 Vite라 유지보수가 가장 쉽다.
- Workbox 기반 설정을 비교적 명확하게 제한할 수 있다.

작업:

1. `vite-plugin-pwa` 추가
2. Vite 설정에 PWA 플러그인 연결
3. 서비스워커 전략은 최소 범위로 시작
4. precache 대상은 정적 빌드 산출물 중심으로 제한

중요 정책:

- `/api/` 는 캐시 정책에서 제외 또는 network-only 유지
- Xsolla checkout URL 은 캐시 대상에서 제외
- 인증 관련 요청도 캐시하지 않음
- HTML navigation fallback 은 신중하게 사용

권장 방향:

- 처음에는 공격적인 runtime caching 없이 시작
- installability와 기본 앱 shell 등록이 우선

완료 기준:

- 서비스워커 등록 성공
- API/결제 흐름이 기존과 동일하게 동작
- 오프라인에서 오동작하는 캐시 응답이 생기지 않음

## Phase 4. 안전성 검증

목표:

- PWA 적용 후 기존 핵심 흐름이 깨지지 않았는지 확인한다.

필수 검증:

1. 일반 로그인
2. 회원가입
3. 로그아웃
4. 프로필 진입
5. My Jello / Angel Pass 탭 전환
6. Xsolla checkout token 발급
7. 결제창 오버레이 오픈
8. 결제 후 상태 재조회
9. 게스트 -> 회원가입 유도 흐름

추가 검증:

1. 설치 후 앱 standalone 실행
2. 홈 화면 재실행 시 정상 진입
3. 새 배포 후 서비스워커 update 반영

중요 확인 포인트:

- 예전 API 응답이 캐시에서 재사용되면 안 된다.
- premium 상태가 stale 하게 보이면 안 된다.
- 로그아웃 후 다른 사용자 상태가 잔상처럼 보이면 안 된다.

## Phase 5. 운영 반영

목표:

- 배포 환경에서 installable PWA를 안정적으로 유지한다.

작업:

1. 프로덕션 배포 후 Chrome Lighthouse / DevTools 점검
2. Android 실제 설치 테스트
3. iOS 홈 화면 추가 동작 확인
4. 서비스워커 버전 갱신 정책 점검
5. 캐시 무효화 전략 확인

주의:

- 새 빌드 반영이 늦게 보이는 문제는 서비스워커 버전 전략과 직접 연결된다.
- update prompt가 필요한지, 자동 갱신으로 갈지 판단해야 한다.

## 제외 범위

이번 계획에서 명시적으로 제외하는 것:

- 오프라인 플레이 지원
- API 응답 저장소 신설
- 결제 상태 로컬 캐시 체계 재설계
- Firebase/Auth 흐름 변경
- Xsolla 결제 구조 변경
- entitlement 동기화 로직 변경

## 추천 구현 순서

실제 작업 순서는 아래가 가장 안전하다.

1. manifest 작성
2. 앱 아이콘 준비
3. `index.html` 메타 정리
4. PWA 플러그인 최소 설정
5. API/auth/payment 비캐시 정책 설정
6. 실제 설치 테스트
7. 인증/결제 회귀 검증

## 예상 산출물

예상 파일:

- `public/manifest.webmanifest`
- `public/icons/*`
- `vite.config.ts` 업데이트
- `index.html` 메타/manifest link 업데이트
- 필요 시 `src/main.tsx` 또는 별도 PWA 등록 파일

## 최종 판단

이 프로젝트의 PWA 1차 적용 방향은 아래가 맞다.

- 설치 가능하게 만든다.
- 기존 서버 통신은 유지한다.
- 오프라인은 지원하지 않는다.
- 캐시는 보수적으로 적용한다.
- 결제/인증/권한 상태는 계속 네트워크 기준으로 본다.

즉, 이번 PWA는 “앱처럼 설치 가능한 웹앱”이지, “서버를 대체하는 오프라인 앱”이 아니다.
