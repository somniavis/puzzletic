# 변경 이력 (Changelog)

## 2025-12-07 (Latest Updates)

### 🧩 게임 로직 & UI
- **2025-12-07**
  - **Round & Round Counting Improvements**:
    - Implemented **Progressive Difficulty**: Starts with 3x3 grid (Level 1) and expands to 4x4 (Level 2+) after 3 consecutive wins.
    - **Responsive Layout**: Game area now scales dynamically (max 600px) with perfect square aspect ratio.
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
