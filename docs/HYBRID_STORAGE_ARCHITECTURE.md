# 하이브리드 데이터 저장 아키텍처

> 마지막 업데이트: 2026-01-21 (Hybrid Storage v2)

## 개요

서버 비용 최소화를 위해 **localStorage**와 **Cloudflare D1**을 병행 사용하는 하이브리드 저장 방식입니다.

| 저장소 | 역할 | 특징 |
|--------|------|------|
| **localStorage** | 일상적인 진실의 원천 | 모든 상태 변경 시 즉시 저장 |
| **Cloudflare D1** | 클라우드 백업 | 3가지 시점에만 동기화 |

---

## 핵심 원칙

```
┌─────────────────────────────────────────────────────────┐
│  localStorage = 일상적인 진실의 원천 (실시간 저장)        │
│  Cloudflare D1 = 백업/복구용 (3가지 시점만 동기화)        │
└─────────────────────────────────────────────────────────┘
```

---

## 동기화 시점

| 시점 | 동작 | 파일 위치 |
|------|------|-----------|
| **로그인** | D1 ⚡ localStorage (Smart Sync) | `NurturingContext.tsx:223-279` |
| **15분 자동** | localStorage → D1 | `NurturingContext.tsx:287-302` |
| **Save 버튼** | localStorage → D1 | `NurturingContext.tsx:304-309` |
| **로그아웃** | localStorage → D1 | `SettingsMenu.tsx:131-143` |
| **상태 변경** | localStorage만 | 모든 setState 호출 |
| **불일치 감지** | 동작 없음 (Local 유지) | 로컬이 서버보다 5초 이상 최신일 때 (D1 읽기만 하고 덮어쓰기 중단) |
| **진화 완료** | localStorage → D1 | `NurturingContext.tsx` completeEvolutionAnimation |
---

## 데이터 흐름

```
[상태 변경] ─────────────────────────────> [localStorage] (즉시)
                                                │
                                                │ (15분/Save/로그아웃)
                                                ▼
[로그인] <──────────────────────────────── [Cloudflare D1]
[로그인] <──────────────────────────────── [Cloudflare D1]
```

### 신규 유저 온보딩 (New User Flow)
신규 유저(D1에 데이터 없음)의 경우, 로컬 데이터 상태에 따라 두 가지로 분기합니다:
1.  **Guest Promotion** (`hasCharacter: true`):
    *   게스트 플레이 기록이 있으면 이를 **새 계정으로 승계**합니다.
    *   동작: `Sync to Cloud` + `Save to Local (User ID)`
2.  **Fresh Start** (`hasCharacter: false`):
    *   게스트 기록이 없으면 **완전히 초기화된 상태**로 시작합니다.
    *   동작: `Create Default State` + `Sync to Cloud` + `Overwrite Local (User ID)`
    *   *목적: 이전 게스트의 잔여 데이터(오류 등)가 새 계정에 넘어가는 것을 방지*

### 로그인 시 동작
1. `fetchUserData(user)` 호출
2. D1에서 `game_data` 가져옴
3. D1 데이터로 localStorage 덮어쓰기 (단, 로컬 데이터가 최신이면 역으로 D1 업데이트)
4. 신규 유저면 로컬 상태를 D1에 업로드

### 로그아웃 시 동작
1. `saveToCloud()` 호출
2. 현재 localStorage 상태를 D1에 저장
3. Firebase 로그아웃 실행

---

## 키 네이밍 규칙

### 클라이언트 → 서버 (snake_case)
```typescript
const payload = {
  email,
  display_name,      // ✅ snake_case
  level, xp, gro,
  current_land,      // ✅ snake_case
  inventory,
  game_data,         // ✅ snake_case (전체 상태 JSON)
  created_at,        // ✅ snake_case
};
```

### 서버 수신 (호환성 지원)
```javascript
// Worker에서 둘 다 수용 (snake_case 우선)
const displayName = body.display_name || body.displayName;
const currentLand = body.current_land || body.currentLand;
const gameData = body.game_data || body.gameData;
```

---

## D1 스키마 구조

### 개별 컬럼 vs game_data

| 필드 | 개별 컬럼 | game_data |
|------|-----------|-----------|
| `level`, `xp`, `gro` | ✅ (통계용) | ✅ |
| `hasCharacter`, `stats` | ❌ | ✅ |
| `poops`, `bugs` | ❌ | ✅ |
| `hallOfFame` | ❌ | ✅ |

**원칙:**
- 개별 컬럼 = D1 대시보드/통계 쿼리용
- `game_data` = 게임 상태 복원의 **유일한 원천**

---

## 주요 파일

| 파일 | 역할 |
|------|------|
| `src/services/syncService.ts` | D1 API 통신, sanitizeForD1 |
| `src/services/persistenceService.ts` | localStorage 저장/로드 |
| `src/contexts/NurturingContext.tsx` | 동기화 로직 조율 |
| `backend/api-grogrojello/src/index.js` | Cloudflare Worker |

---

## sanitizeForD1 함수

D1은 `undefined` 값을 지원하지 않으므로, 모든 `undefined`를 `null`로 변환합니다.

```typescript
const sanitizeForD1 = (obj: any): any => {
  if (obj === undefined) return null;
  if (obj === null) return null;
  if (typeof obj !== 'object') return obj;
  if (Array.isArray(obj)) return obj.map(sanitizeForD1);
  
  const result: Record<string, any> = {};
  for (const [key, value] of Object.entries(obj)) {
    result[key] = sanitizeForD1(value);
  }
  return result;
};
```

---

## 다중 계정 지원

localStorage 키에 `userId`가 포함되어 계정별로 분리 저장됩니다:

```
puzzleletic_nurturing_state_v4_{userId}
puzzleletic_checksum_{userId}
```

---

## 이중 안전장치 (Fail-Safe Persistence)

### 진화 애니메이션 반복 문제 해결
가끔 메인 상태 객체(`puzzleletic_nurturing_state_v4`)의 저장이 물리적으로 실패하거나, 클라우드 동기화 과정에서 `lastSeenStage` 필드가 유실되는 경우를 대비해 **독립적인 보조 키**를 사용합니다.

1.  **목적**: 진화 애니메이션 무한 루프(Loop on Refresh) 원천 차단
2.  **키**: `puzzleletic_last_seen_stage` (User ID에 종속되지 않은 기기별 플래그)
3.  **메커니즘**:
    *   **쓰기**: `completeEvolutionAnimation` 시점, 메인 상태와 별도로 `localStorage`에 즉시 기록 (동기식)
    *   **읽기**: `useEffect` 애니메이션 트리거 시점, 메인 상태(`state.lastSeenStage`)가 없거나 낮더라도 이 보조 키 값이 높으면 애니메이션을 스킵
4.  **효과**: 서버 비용 0원으로 오프라인 환경에서도 완벽한 상태 정합성 보장

---

---

## 게임 점수 저장 (Hybrid Storage v2)

> **v2 (2026-01-21)**: `minigameStats` → `gameScores` 압축 포맷으로 전환

모든 게임의 점수는 **NurturingPersistentState** 내부에 통합되어 관리되며, 하이브리드 저장 방식(로컬+D1)을 따릅니다.

### 데이터 구조 (v2 - Compact Format)
```typescript
interface NurturingPersistentState {
  // ...
  
  // 1. 게임 점수 (Game ID -> Compact Value)
  gameScores?: Record<string, GameScoreValue>;
  
  // 2. 카테고리 진행도 (Category -> Last Unlocked Game ID)
  categoryProgress?: Record<string, string>;
}

// GameScoreValue 형식:
// - 숫자: 마스터 완료된 게임 (예: 2500 = 최고점수)
// - 문자열: 진행 중인 게임 (예: "1200:3" = 최고점수:클리어횟수)
type GameScoreValue = number | string;
```

### v1 → v2 비교
| 항목 | v1 (minigameStats) | v2 (gameScores) |
|------|-------------------|------------------|
| 필드당 크기 | ~100 bytes | ~8 bytes |
| 200게임 총량 | ~20KB | ~1.6KB |
| **절감률** | - | **92%** |
| 필드 구조 | 객체 (4개 필드) | 숫자 또는 문자열 |

### 예시
```typescript
// v1 (deprecated)
minigameStats: {
  'math-archery': { totalScore: 5000, playCount: 5, highScore: 1200, lastPlayedAt: 1705123456 },
  'fishing-count': { totalScore: 3000, playCount: 3, highScore: 1100, lastPlayedAt: 1705123456 },
}

// v2 (current)
gameScores: {
  'math-archery': 1200,      // 마스터됨 (숫자 = 최고점수만)
  'fishing-count': '1100:3', // 진행중 (점수:횟수)
}
categoryProgress: {
  'math-adventure': 'number-hive',  // 다음 해금 대기 게임
}
```

### 동작 원리
1.  **게임 종료 (Game Over)**: `useGameScoring` 훅이 `recordGameScore()` 호출
2.  **상태 갱신**:
    *   `parseGameScore()`로 현재 값 파싱
    *   새 점수/횟수 계산
    *   `createGameScore()`로 압축 형식 생성
    *   해금 조건 충족 시 `categoryProgress` 업데이트
3.  **저장**: `localStorage`에 즉시 반영
4.  **동기화**: 자동 저장 주기(15분) 또는 종료 시점에 D1 `game_data` JSON으로 통합되어 업로드

### 마이그레이션
기존 유저의 `minigameStats`는 다음 시점에 자동 변환됩니다:
- **로그인 시**: `NurturingContext.tsx`에서 클라우드 데이터 로드 시
- **앱 시작 시**: `persistenceService.ts`에서 로컬 데이터 로드 시

```typescript
// 마이그레이션 로직 (자동 실행)
if (loaded.minigameStats && !loaded.gameScores) {
  const migratedScores = {};
  for (const [gameId, stats] of Object.entries(loaded.minigameStats)) {
    const isUnlocked = stats.playCount >= threshold;
    migratedScores[gameId] = createGameScore(stats.highScore, stats.playCount, isUnlocked);
  }
  loaded.gameScores = migratedScores;
  delete loaded.minigameStats;
}
```

---

## 트러블슈팅

### D1_TYPE_ERROR: undefined not supported
- **원인**: payload에 undefined 값 포함
- **해결**: `sanitizeForD1()` 함수로 전체 payload 처리

### 로그인 시 데이터 복원 안 됨
- **확인**: Console에서 `☁️ Cloud data found` 로그 확인
- **원인**: `game_data` 파싱 실패 가능
- **해결**: Worker에서 JSON.stringify/parse 확인

### Save 버튼 실패/지연
- **확인**: Console에서 `☁️ Sync failed:` 에러 또는 `☁️ Sync timed out` 확인
- **최적화**: `syncService.ts`에 5초 타임아웃 적용됨 (무한 대기 방지)

---

## 최적화 전략 (Performance & Optimization)

### 1. 네트워크 타임아웃 (Network Timeout)
- **문제**: 해외 서버/Cold Start로 인한 저장 지연 시 앱이 멈추는 현상
- **해결**: 모든 Sync 요청에 `AbortController`를 사용하여 **5초 타임아웃** 적용
- **효과**: 네트워크가 불안정해도 UX가 Block되지 않음 (최대 5초 대기 후 제어권 반환)

### 2. 백그라운드 틱 제어 (Tick Control)
- **문제**: 로그아웃 후에도 `setInterval`이 돌아가며 리소스 소모
- **해결**: `NurturingContext`의 틱 타이머에 `!user` 체크 추가
- **효과**: 로그아웃 즉시 타이머 해제 (ClearInterval), 불필요한 연산 방지

### 3. 데이터 초기화 안정성 (Safe Initialization)
- **문제**: 구버전 클라우드 데이터가 신규 필드(예: `unlockedJellos`)를 덮어써서 `undefined` 발생
- **해결**: `createDefaultState()`와 병합하는 전략 사용
  ```typescript
  const restoredState = {
    ...createDefaultState(), // 1. 최신 기본 구조 보장
    ...cloudData,            // 2. 클라우드 데이터 덮어쓰기
    lastActiveTime: Date.now()
  };
  ```
- **효과**: 스키마 변경 시 별도의 복잡한 마이그레이션 함수 없이도 구조적 안정성 확보

### 3-1. 스마트 병합 전략 (Smart Merge - 2026.01.21)
- **문제**: 클라우드 데이터가 구버전이라 신규 필드(예: `categoryProgress`)가 없을 때, 로컬의 진행 상황을 덮어써버리는 문제 (Reset after Refresh)
- **해결**: `NurturingContext`에 스키마 기반 병합 로직 추가
    - **Legacy Data**: 클라우드에 키가 아예 없음 (`undefined`) -> **로컬 데이터 유지**
    - **Valid Reset**: 클라우드에 키가 있음 (빈 객체 `{}`) -> **클라우드 데이터 신뢰** (초기화 반영)
    ```typescript
    if (fullState.categoryProgress === undefined) {
      // Legacy Cloud Data detected -> Keep Local Progress
      if (localState.categoryProgress) {
         restoredState.categoryProgress = localState.categoryProgress;
      }
    }
    ```
- **효과**: 동기화 시 데이터 유실 방지와 유효한 초기화(Reset)를 동시에 지원

### 3-2. 변경 기반 동기화 최소화 (Dirty Check - 2026.01.21)
- **문제**: 유저가 아무 활동도 하지 않고 방치(Idle)해도 15분마다 클라우드 데이터 저장을 시도하여 서버 비용 낭비
- **해결**: `lastSyncedStateRef`를 도입하여 마지막 성공 저장 시점의 상태 스냅샷 보유
    - **Auto-Save**: `JSON.stringify(currentState) === lastSyncedStateRef` 이면 동기화 전송 Skip
    - **Manual Save**: 수동 저장 성공 시에도 `lastSyncedStateRef`를 갱신하여, 직후 자동 저장이 중복 발생하지 않도록 처리
- **효과**:
    - **트래픽 절감**: 방치형 플레이어나 단순 조회 유저의 불필요한 네트워크 요청 100% 제거
    - **서버 부하 감소**: 실질적인 데이터 변경 시에만 쓰기 작업 수행

### 3-3. 똥/벌레 배열 압축 (Compact Poop/Bug Storage - Hybrid Storage v2.1)
- **문제**: 똥과 벌레 객체의 좌표값이 소수점 14자리까지 저장되어 불필요하게 데이터 비대
  ```typescript
  // Before: 개별 객체 저장 (~150 bytes/poop, ~200 bytes/bug)
  poops: [{ id, x: 71.33729627515501, y: 35.30070954327439, createdAt, healthDebuff }, ...]
  bugs: [{ id, type, x: 77.85805644568335, y: 76.95863972914596, ... }, ...]
  ```
- **해결**: 클라우드 동기화 시 배열 → 개수로 압축 (`syncService.ts:compactStateForSync`)
  ```typescript
  // After: 개수만 저장 (~30 bytes total)
  poopCount: 5,
  bugCounts: { fly: 2, mosquito: 3 }
  ```
- **복원**: 로그인 시 개수만큼 랜덤 위치에 재생성 (`NurturingContext.tsx`)
- **효과**:
    - **~98% 데이터 절감** (똥 5개 + 벌레 5개: ~1.7KB → ~32 bytes)
    - 정확한 위치는 게임플레이에 영향 없음 (시각적 요소만)

### 4. 카테고리 기반 진행도 저장 (Category-Based Progression)
- **문제**: 모든 게임의 개별 통계를 저장하면 게임 수 증가에 따라 데이터가 비대해짐
- **해결**: `categoryProgress` + `gameScores` 조합
  ```typescript
  // 카테고리별 진행 상태 (다음 해금 대기 게임 ID)
  categoryProgress: {
    'math-adventure': 'number-hive',
    'math-genius': 'front-addition-lv3',
  }
  
  // 개별 게임 점수 (압축 포맷)
  gameScores: {
    'math-archery': 1200,      // 마스터됨
    'fishing-count': '1100:3', // 진행중
  }
  ```
- **순서 정의**: `src/constants/gameOrder.ts`에서 카테고리별 게임 순서 관리
- **해금 로직**: `isGameUnlocked()`가 순서 인덱스 비교와 클리어 횟수로 O(1) 판정
- **효과**: 
    - 데이터 크기 ~92% 감소 (200게임 기준: 20KB → 1.6KB)
    - 동기화 페이로드 대폭 절감
    - 신규 게임 삽입 시 기존 데이터 자동 호환

---

## 관련 파일 (Hybrid Storage v2)

| 파일 | 역할 |
|------|------|
| `src/types/nurturing.ts` | `GameScoreValue` 타입 정의 |
| `src/utils/progression.ts` | `parseGameScore()`, `createGameScore()`, `isGameUnlocked()` |
| `src/utils/resultMetrics.ts` | `calculateMastery()` |
| `src/contexts/NurturingContext.tsx` | `recordGameScore()`, 마이그레이션 |
| `src/services/persistenceService.ts` | 로컬 저장, 마이그레이션 |
| `src/constants/gameOrder.ts` | 카테고리별 게임 순서 |
| `src/hooks/usePlayPageLogic.ts` | PlayPage 로직 |
| `src/games/layouts/Standard/shared/useGameScoring.ts` | 게임 점수 처리 |
