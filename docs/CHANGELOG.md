# 변경 이력 (Changelog)


## 2026-01-26 (Latest Updates)

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
