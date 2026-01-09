# 하이브리드 데이터 저장 아키텍처

> 마지막 업데이트: 2026-01-01

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

## 미니게임 점수 저장 (Minigame Scoring)

모든 미니게임의 점수는 **NurturingPersistentState** 내부에 통합되어 관리되며, 하이브리드 저장 방식(로컬+D1)을 따릅니다.

### 데이터 구조
```typescript
interface NurturingPersistentState {
  // ...
  // 1. 개별 게임 통계 (Game ID -> Stats)
  minigameStats?: Record<string, {
    totalScore: number;   // 누적 점수
    playCount: number;    // 누적 플레이 횟수
    highScore: number;    // 최고 점수 (Prev Best)
    lastPlayedAt: number; // 마지막 플레이 시각
  }>;

  // 2. 전체 합산 통계 (Global Stats)
  totalMinigameScore?: number;      // 모든 게임 점수 총합
  totalMinigamePlayCount?: number;  // 모든 게임 판수 총합
}
```

### 동작 원리
1.  **게임 종료 (Game Over)**: `useGameScoring` 훅이 `recordGameScore` 호출.
2.  **상태 갱신**:
    *   해당 게임의 `minigameStats` 업데이트.
    *   전역 `totalMinigameScore`, `totalMinigamePlayCount` 동시 업데이트.
3.  **저장**: `localStorage`에 즉시 반영.
4.  **동기화**: 자동 저장 주기(15분) 또는 종료 시점에 D1 `game_data` JSON으로 통합되어 업로드.

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

