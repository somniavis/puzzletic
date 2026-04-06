# 변경 이력 (Changelog)

## 2026-04-06 (API Abuse Hardening)

### 🔒 API 남용 방어 1차/2차/3차 적용
- Cloudflare Worker에 다층 rate limit을 추가했습니다.
  - pre-auth (`IP + path uid`)
  - post-auth (`uid`)
  - auth failure 누적 차단
  - sync cooldown
- 요청 비용을 줄이기 위해 Worker에 조기 차단 계층을 추가했습니다.
  - invalid method → `405`
  - unknown subpath → `404`
  - non-json required POST → `415`
  - oversized body → `413`
- 클라이언트 sync 계층을 coalescing/retry 방식으로 보강했습니다.
  - 짧은 시간 연속 sync를 1회 업로드로 병합
  - `429 Retry-After` 자동 재시도
  - 로그인 복원은 `forceFresh`로 최신 cloud를 우선 조회
  - logout 전 cloud save 실패 시 로그아웃 중단

### 👀 보안 관측성 강화
- Worker에 structured security logging을 추가했습니다.
- 주요 로그 이벤트:
  - `cors_origin_denied`
  - `invalid_api_path`
  - `request_shape_rejected`
  - `auth_rejected`
  - `rate_limit_hit`
  - `abnormal_value_rejected`
- CORS는 브라우저 origin 정책일 뿐 직접 호출 방어가 아니라는 점을 문서에 명시했습니다.

### 🛡️ 게임 데이터 조작 방어
- Worker sync 저장 전에 `level`, `xp`, `gro`, `star`, `current_land`, `inventory`에 대해 라이트 타입 검증을 적용했습니다.
- `star` 급증 제한과 신규 유저 초기값 제한을 추가해 별/진행도 비정상 증폭을 차단했습니다.
- 프로덕션 빌드에서는 Profile 페이지 디버그 패널과 `debugAddStars`, `debugUnlockAllGames` 동작을 비활성화했습니다.

## 2026-03-28 (Domain Rollout & Bundle Optimization)

### 🌐 신규 도메인 적용 완료 (Production Domain Rollout)
- 실서비스 대표 도메인을 `https://grogrojello.com` 으로 확정했습니다.
- `www.grogrojello.com` 은 Cloudflare Redirect Rule로 `grogrojello.com` 으로 canonical 리다이렉트되도록 정리했습니다.
- Namecheap 네임서버를 Cloudflare로 전환하고, Cloudflare가 권한 DNS를 관리하도록 마이그레이션했습니다.
- 웹은 `Vercel`, API는 `Cloudflare Worker` 로 역할을 분리한 상태를 유지했습니다.
- Firebase Authorized Domains에 `grogrojello.com`, `www.grogrojello.com` 을 추가했고, 이메일 로그인/Google 로그인을 실제 도메인에서 재검증했습니다.

### ☁️ API Custom Domain 안정화 (Worker Custom Domain)
- Worker API를 `https://api.grogrojello.com` 으로 연결했습니다.
- Cloudflare DNS Worker record, Edge Certificates, Worker `Domains & Routes` 상태를 점검해 커스텀 도메인 연결과 인증서가 `Active` 인 것을 확인했습니다.
- 운영 API 기본 주소를 `api.grogrojello.com` 으로 전환했습니다.
- 운영 API 경로를 `api.grogrojello.com` 단일 기준으로 정리했습니다.

### 🔒 운영 보호 설정 (Prelaunch Safety)
- 검색엔진 색인을 막기 위해 `robots.txt`, `meta robots`, `X-Robots-Tag` 를 적용했습니다.
- Worker CORS 허용 Origin을 `grogrojello.com`, `www.grogrojello.com`, `localhost:5173` 으로 제한했습니다.

### 🚀 초기 번들 최적화 1차 (Route / Locale / Species Split)
- `PetRoom` 을 정적 import에서 lazy import로 변경해 첫 진입 번들을 줄였습니다.
- i18n 초기 로드를 영어/한국어만으로 제한하고, 나머지 언어는 동적 import로 전환했습니다.
- `species` 데이터를 코어/상세로 분리해 초기 진입 경로는 경량 데이터만 직접 사용하도록 정리했습니다.
  - 새 파일:
    - `src/data/speciesCore.ts`
    - `src/data/speciesDetails.ts`
  - 기존 `src/data/species.ts` 는 두 데이터를 병합해 도감/관리 화면용 전체 API를 계속 제공합니다.

### 📦 번들 크기 결과 (Main Entry)
- 시작 시점:
  - 메인 JS 약 `1463KB raw / 460.9KB gzip`
- `PetRoom` lazy import 적용 후:
  - 메인 JS 약 `1356.7KB raw / 430.5KB gzip`
- i18n 동적 로드 적용 후:
  - 메인 JS 약 `814.9KB raw / 253.7KB gzip`
- `species` 코어/상세 분리 후:
  - 메인 JS 약 `807.3KB raw / 251.1KB gzip`

### ✅ 검증 메모
- `npm run build` 반복 검증 통과
- 실제 운영 도메인에서 이메일 로그인, Google 로그인, 데이터 불러오기/저장, `www -> apex` 리다이렉트 확인
- `https://api.grogrojello.com/` 에서 `Not Found`, `https://api.grogrojello.com/api/users/test` 에서 인증 헤더 오류 응답 확인

### 🛠️ 후속 안정화 및 진단 정리
- 특정 Safari + 특정 Wi‑Fi 환경에서 `api.grogrojello.com` 접근이 실패하며 premium/기존 캐릭터가 복원되지 않는 사례를 조사했습니다.
- 운영 D1 직접 조회 결과, `test34@gmail.com` 계정의 premium(`12_months`)과 기존 `game_data`는 정상 보존되어 있었고, 데이터 유실이 아니라 네트워크/DNS 환경 문제로 결론냈습니다.
- 기존 계정이 일시적인 `notFound` 응답을 받을 때 새 계정처럼 다시 초기화되지 않도록 `useNurturingSync` 보호 로직을 추가했습니다.
- 이후 하이브리드 저장 흐름과의 충돌을 줄이기 위해, `notFound`이더라도 현재 사용자 로컬 캐시에 의미 있는 데이터가 있으면 그 로컬 데이터를 기준으로 cloud row를 복구하도록 보호 로직을 완화했습니다.
- 이 완화는 `saveToCloud` / 자동 저장 / 일반 sync 흐름은 그대로 두고, `notFound` 분기 판단만 조정한 것입니다.
- sync payload에 `email`을 다시 포함해 운영 D1에서 특정 계정 추적이 가능하도록 보강했습니다.
- 로컬 모바일 테스트를 위해 Worker CORS가 `localhost`뿐 아니라 사설 IP 대역(`172.16-31.x.x`, `192.168.x.x`, `10.x.x.x`)의 Vite dev origin도 허용하도록 확장했습니다.
- Worker `wrangler.jsonc`를 실제 배포 상태와 맞췄습니다.
  - `workers_dev = false` 로 정리
  - custom domain route를 `api.grogrojello.com` 형태로 유지
- Cloudflare Worker를 재배포해 `api.grogrojello.com` custom domain 기준 구성을 유지했습니다.

## 2026-02-13 (Security Hotfix)

### 🔐 백엔드 인증/인가 강화 (Worker AuthN/AuthZ)
- **Firebase ID Token 검증 추가**: Cloudflare Worker가 `Authorization: Bearer <token>`을 필수로 검사하고, 토큰 서명/클레임(`iss`, `aud`, `exp`, `iat`, `sub`)을 검증하도록 개선.
- **UID 위변조 차단**: URL 경로의 `:uid`와 토큰의 `sub`가 다를 경우 `403 UID mismatch`로 즉시 차단.
- **적용 범위**: `GET /api/users/:uid`, `POST /api/users/:uid`, `POST /api/users/:uid/purchase`, `POST /api/users/:uid/cancel` 전부 인증 게이트 적용.
- **JWK 캐시 적용**: Google Secure Token JWK를 `Cache-Control max-age` 기준으로 캐싱하여 검증 비용 최소화.
- **환경변수화**: Worker 설정(`wrangler.jsonc`)에 `FIREBASE_PROJECT_ID`를 명시해 프로젝트 식별값을 코드에서 분리.

### 🧾 구독 스키마 정합성 보강 (Subscription Schema Consistency)
- `users` 테이블에 구독 컬럼 추가: `is_premium`, `subscription_end`, `subscription_plan`.
- 운영 DB 반영용 SQL 추가: `backend/api-grogrojello/migrations/2026-02-13_add_subscription_columns.sql`.
- `purchase/cancel` 엔드포인트를 **UPSERT**로 변경해, 유저 행이 없어도 구독 상태가 누락 없이 저장되도록 보강.

### ⚠️ 보안 메모
- 기존의 `XP/GRO` 급변 제한(Delta Validation)은 **값 검증**이고, 이번 수정은 **요청 주체 검증(인증/인가)** 입니다.
- 두 방어선은 상호 보완 관계이며, 인증 게이트가 먼저 통과되어야 값 검증이 의미를 가집니다.

## 2026-01-27 (Today's Updates)

### 🔒 데이터 무결성 및 보안 (Data Integrity & Security)
- **자가 치유(Self-Healing) 저장소**: 데이터와 체크섬이 일시적으로 불일치할 경우, 데이터를 삭제(Reset)하는 대신 **올바른 체크섬으로 자동 복구**하도록 개선하여 무한 에러 루프 방지.
- **Robust Checksum V2**: `lastActiveTime`이 누락되거나 잘못된 경우에도 체크섬 계산이 안전하게 수행되도록 로직 강화 (`|| 0` 처리).

### 👥 게스트 관리 개선 (Guest Management)
- **진화 제한 (Guest Restriction)**: 게스트 유저가 Stage 2 진화를 시도할 때 차단하고, **회원가입 유도 팝업(`SignupPromoModal`)**을 표시.
- **데이터 이관 준비**: 게스트 데이터를 클라우드로 이관하기 위한 `migrateGuestToCloud` 서비스 함수 구현.

### 🌐 UI/UX 및 현지화 (UI/UX & Localization)
- **Back Navigation Fix**: 로그인/가입 페이지에서 '뒤로가기' 클릭 시, 진입했던 위치(예: 펫룸)로 정확히 돌아가도록 라우팅 로직 개선.
- **Auth Flow Localization**: 로그인/가입/홍보 팝업의 모든 텍스트(한국어, 영어, 일본어) 완벽 지원.
- **Lint Fix**: 불필요한 콘솔 로그(`useLocation`) 및 사용하지 않는 import 정리.


### 🧹 PetRoom 리팩토링 (Refactoring)
- **대규모 구조 개선**: 1400줄에 달하던 `PetRoom.tsx` 파일을 역할별로 분리하여 코드 복잡도를 60% 이상 감소시켰습니다.
- **Custom Hooks 분리**:
  - `usePetRoomUI`: UI 상태 (메뉴, 모달) 관리
  - `usePetInteraction`: 캐릭터 상호작용 및 움직임
  - `usePetActions`: 먹이주기, 씻기 등 주요 행동 로직
  - `usePetCamera`: 화면 캡처 및 공유 기능
- **Sub-components 분리**:
  - `PetWorldLayer`: 게임 월드(배경, 캐릭터, 오브젝트) 렌더링
  - `PetRoomMenus`: 복잡한 팝업 메뉴들 별도 관리
  - `PetRoomHeader`, `PetActionButtons`: 상하단 UI 분리

### 🐛 버그 수정 (Bug Fixes)
- **Camera CORS Issue**: `html-to-image` 사용 시 Font Awesome CSS 로드 문제로 인한 SecurityError 해결 (`crossorigin="anonymous"` 속성 추가).
- **Bubble Visibility Fix**: 리팩토링 후 젤로 클릭 시 말풍선 및 스탯 업데이트가 누락되던 문제 수정 (`handleCharacterClick` 연결 복구).
- **Game Unlock Condition Relaxed**: 해금 조건 완화 (점수 획득 시 승패 무관하게 플레이 횟수 인정, 별 획득은 클리어 시에만 유지).
- **Game Over UI Update**: 게임 오버 화면에 별(Star) 획득 배지 추가 및 GRO 색상 변경 (Yellow → Green).
- **Circular Dependency Fix**: `NurturingContext`와 `Registry` 간의 순환 참조 문제 해결 (별 획득 로직 계산 주체 변경: Context -> useGameScoring).
- **Adventure UI Fix**: 플레이 페이지에서 Adventure/Brain 카드 진행도 표시 오류 수정 (`clearCount - 1` 로직 제거하여 즉시 반영되도록 변경).
- **Brain Game Unlock Fix**: 점수 획득 여부와 관계없이 게임 종료(Game Over) 시 무조건 플레이 횟수가 인정되도록 해금 조건 로직 전면 수정.
- **Unlock Logic Refinement**: 플레이 횟수 인정 조건을 `score > 0`으로 재조정 (0점인 경우 카운트 제외).
- **Strategy Games Update**: `TicTacToe`, `Omok` 등 난이도가 높은 전략 게임은 패배 시에도 1점(위로 점수)을 부여하여 도전 횟수가 인정되도록 개선.
- **Brain Game ID Uniformity**: `ColorLink` 등 일부 브레인 게임의 내부 ID와 레지스트리 ID 불일치 문제 수정 (점수 저장 키 통일).

## 2026-01-20 (Previous Updates)

### 🚀 진행도 저장 최적화 (Progression Storage Optimization)
- **문제**: 게임 수 증가 시 데이터 크기가 선형적으로 증가 (200게임 → ~40KB/유저)
- **해결**: 카테고리별 "최고 도달점 ID"만 저장하는 방식으로 변경
- **새 파일**: `src/constants/gameOrder.ts` - 카테고리별 게임 순서 정의
- **효과**: 데이터 크기 ~40배 감소 (40KB → 1KB), 해금 계산 O(n) → O(1)

### 🔧 번역 키 수정 (Translation Key Fixes)
- **18개 게임의 HowToPlay 번역 키** `.desc` → `.description`으로 일괄 수정
- Math Level 1/2, Brain Level 1/2, Genius 게임 모두 포함

## 2025-12-21 (Previous Updates)

### 🧩 게임 로직 & UI (Game Logic & UI)
- **Number Balance 게임 개선**:
  - **2개 아이템 필수화**: 정답이 되는 단일 아이템이 나오지 않도록 개선하여, 반드시 2개 이상의 조합으로 풀어야 하도록 난이도를 조정했습니다.
  - **즉각적인 오답 처리**: 무게가 초과되는 순간 즉시 오답 판정을 내리도록 하여 피드백 속도를 높였습니다.
  - **드래그 앤 드롭 개선**: 글로벌 이벤트 리스너를 적용하여 드래그 중 아이템이 멈추거나 사라지는 현상을 근본적으로 해결했습니다.
  - **UI 개선**: 파워업 버튼 왼쪽 정렬, 보기 영역 하단 밀착, 직각 모서리 적용 등 깔끔한 디자인으로 변경했습니다.
  - **사운드 수정**: 오답 시 젤로 사운드가 간헐적으로 재생되지 않던 문제를 수정하여 즉시 재생되도록 개선했습니다.
  - **모바일/태블릿 최적화**: 
    - 아이패드(Safari)에서 드래그 앤 드롭이 끊기는 현상을 `preventDefault` 및 하드웨어 가속(`will-change`) 적용으로 해결했습니다.
    - 모바일 화면에서 목표 숫자 박스가 넘치는 문제를 해결했습니다.
  - **난이도 및 로직 개선**:
    - **오답 보기 다양화**: 오답 보기가 너무 쉽게 소거되는 문제를 해결하기 위해, 정답과 같은 과일이거나, 숫자가 정답과 유사한(Tricky Value) 보기가 50:50 확률로 출제되도록 개선했습니다.
    - **무한 루프 수정**: 목표 숫자가 작을 때(예: 2) 유효한 오답을 찾지 못해 게임이 멈추는(Freezing) 치명적인 오류를 해결했습니다.

### 🏗️ 아키텍처 개선 (Architecture)
- **Game Registry 리팩토링**:
  - 기존의 폴더명 기반 순서 관리(`001_GameName`)를 제거하고, `registry.ts`에서 중앙 집중식으로 게임 순서를 관리하도록 구조를 변경했습니다.
  - 이를 통해 파일 이름 변경 없이 코드 상에서 손쉽게 게임 순서를 변경할 수 있습니다.
- **데이터 마이그레이션**:
  - 게임 ID 변경(`math-01-fishing-count` -> `math-fishing-count`)에 따라 기존 유저의 플레이 기록이 유실되지 않도록 자동 마이그레이션 로직을 추가했습니다.

## 2025-12-14 (Previous Updates)

### ✨ 주요 기능 추가 (New Features)
- **자유로운 캐릭터 관리 (Admin Gallery Update)**:
  - 갤러리/관리자 화면에서 특정 진화 단계(1~5단계)를 직접 선택하여 소환할 수 있는 기능이 추가되었습니다.
  - 이제 모든 젤로의 모든 성장 단계를 손쉽게 확인하고 테스트할 수 있습니다.
- **오렌지 젤로 추가 (Orange Jello)**:
  - 새로운 젤로 종 '오렌지 젤로'가 추가되었습니다. (5단계 진화 포함)
- **히든 진화 시스템 (Hidden Evolution Structure)**:
  - 단순 레벨업이 아닌, 특정 조건(먹이 섭취량, 미니게임 횟수 등)을 만족해야만 진화할 수 있는 **Stage 5 히든 진화** 구조가 구현되었습니다.
  - 이를 위해 캐릭터의 모든 행동 이력(History)을 추적하고 저장하는 시스템이 구축되었습니다.

### 🛠️ 시스템 개선 (System Improvements)
- **데이터 구조 개선**:
  - `CharacterHistory`: 유저의 모든 행동(먹이 종류별 섭취 수, 게임 플레이 횟수 등)을 효율적으로 카운팅하여 저장합니다.
  - `speciesId` Persistence: 현재 키우고 있는 젤로의 종(`speciesId`) 정보가 로컬 저장소에 안전하게 유지되도록 개선되었습니다.
  - **진화 서비스 로직**: `checkEvolutionConditions` 함수를 통해 진화 시점에 조건을 검사하고, 조건 달성 여부에 따라 진화 분기를 결정하도록 로직이 고도화되었습니다.

## 2025-12-07 (Previous Updates)

### 🧩 게임 로직 & UI
- **2025-12-07**
  - **Round & Round Counting Improvements**:
    - Implemented **Progressive Difficulty**: Starts with 3x3 grid (Level 1) and expands to 4x4 (Level 2+) after 3 consecutive wins.
    - **Responsive Layout**: Game area now scales dynamically (max 600px) with perfect square aspect ratio.
    - **Mobile Optimization**: 
      - Enforced 100% width usage on small screens for maximum visibility.
      - Optimized grid gaps (0.4rem) and card scaling (0.92x) to ensure zero overlap on <350px devices.
    - **Optimized UI**: Dynamic font sizing and grid adjustments prevent overflow on mobile devices.
  - **Sound System Standardization**:
    - **Synchronized BGM**: Added BGM toggle to Play Page, Game, and Game Over screens, syncing state globally.
    - **Standardized SFX**: Implemented consistent feedback sounds across all games (Click: Button, Correct: Clear/Eating, Wrong: Jello).
  - **Refined Animations**: Enhanced "Round Counting" animation with overlapping star bursts and smoother timing.
  - **Play Page Layout**: Updated standard game list to use a vertical card layout for better readability.
  - **Game Over Screen**: Added 3D card effects and gamified the results screen.
  - **Architecture**:
    - Introduced `registry.ts` for centralized game management.
    - Implemented Hybrid i18n architecture (Global + Game-specific).
  - **UI Refinements**: Added global BGM toggle, improved dashboard alignment.

## 2025-12-04 (Previous Updates)

### 🛠️ UI/UX 개선
- **양치질 애니메이션**: 칫솔 아이콘을 표준 이모지(`🪥`)로 변경하고, 애니메이션 위치와 회전을 최적화하여 자연스러운 연출을 구현했습니다.
- **애니메이션 정렬**: 음식, 알약, 주사기 애니메이션의 위치를 캐릭터에 맞춰 정밀하게 조정했습니다. (음식/알약 +0.8%, 주사기 경로 수정)
- **사용성 개선**: 음식 메뉴 열기 시 기본 선택 카테고리를 'Fruits'로 변경하여 접근성을 높였습니다.

### 📝 콘텐츠 업데이트
- **상점 명칭 변경**: 'Ground' 카테고리를 'Land'로 변경하고, 아이템 명칭을 더 감성적인 영어 표현(Basic Land, Deep Forest 등)으로 전면 개편했습니다.

### ♻️ 코드 리팩토링
- **컴포넌트 분리**: `PetRoom.tsx` 내 중복되던 메뉴 팝업 로직을 `MenuModal` 컴포넌트로 분리하여 코드 재사용성을 높이고 유지보수를 용이하게 했습니다.

## 2025-11-29 (Recent Updates)

### 🔒 보안 강화
- **데이터 암호화 (`simpleEncryption.ts`)**: `localStorage`에 저장되는 게임 데이터(특히 재화 `glo`)를 보호하기 위해 XOR 암호화 및 체크섬 검증 로직을 도입했습니다.
- **무결성 검사**: 데이터 로드 시 체크섬을 확인하여 조작된 데이터를 감지하고 차단합니다.

### 🎨 시각 효과 개선
- **감정 표현 (Emotion Bubbles)**: 캐릭터의 상태(배고픔, 아픔, 기쁨 등)를 직관적으로 보여주는 말풍선 시스템이 추가되었습니다.
- **샤워 애니메이션**: 샤워기 사용 시 물줄기와 비누거품이 나타나는 연출이 강화되었습니다.
- **상호작용 애니메이션**: 먹이주기, 약주기 시 아이콘이 캐릭터에게 날아가는 애니메이션이 추가되었습니다.

### 🔊 사운드 시스템
- **사운드 엔진 (`SoundContext`)**: 전역 사운드 관리 시스템이 구축되었습니다.
- **효과음 추가**: 버튼 클릭, 식사, 청소, 샤워 등 주요 행동에 효과음이 적용되었습니다.
- **프리로드**: 앱 시작 시 사운드 리소스를 미리 로드하여 반응 속도를 개선했습니다.

### 🧹 청소 도구 확장
- **샤워기**: 비용을 지불하고 캐릭터를 씻겨줄 수 있습니다. (건강/행복도 상승)
- **로봇 청소기**: 비용을 지불하고 방 안의 모든 오염물(똥, 벌레)을 한 번에 제거합니다.

### 🐛 기타 수정
- **버그 수정**: 오프라인 진행 계산 로직 안정화
- **UI 개선**: 펫 룸 UI 레이아웃 및 아이콘 직관성 개선
