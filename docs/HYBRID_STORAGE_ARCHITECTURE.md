# 하이브리드 데이터 저장 아키텍처 v2.1

> 마지막 업데이트: 2026-01-21 (Throttled Persistence & Wallet Protection)

## 개요

서버 비용 최소화와 데이터 안전성을 동시에 확보하기 위해 **3중 저장 계층(3-Layer Storage)**을 사용하는 하이브리드 아키텍처입니다.

| 계층 | 저장소 | 역할 | 저장 주기 | 특징 |
|------|--------|------|-----------|------|
| **L1** | **Memory (State)** | 실시간 상태 반영 | 즉시 (React State) | 화면 갱신용 (휘발성) |
| **L2** | **localStorage** | 로컬 백업 (장애 복구) | **1초 (Throttled)** | 새로고침/앱종료 방어 (반영구) |
| **L3** | **Cloudflare D1** | 클라우드 원본 | 이벤트 기반 | 기기 간 동기화 (영구) |

---

## 핵심 원칙: "진행도 우선 법칙 (Progress Over Timestamp)"

단순히 "최신 시간"을 믿는 것이 아니라, **"더 많은 진행도"를 가진 데이터를 신뢰**합니다.

```
┌──────────────────────────────────────────────────────────────┐
│  Conflict Resolution Rule:                                   │
│                                                              │
│  IF (Cloud.XP > Local.XP) OR (Cloud.Money > Local.Money)     │
│     THEN Trust Cloud (Server Wins) 🏆                        │
│  ELSE IF (Local.Time > Cloud.Time + 5sec)                    │
│     THEN Trust Local (Client Wins) 📱                        │
│  ELSE                                                        │
│     Trust Cloud (Default) ☁️                                 │
└──────────────────────────────────────────────────────────────┘
```
*목적: 실수로 옛날 기기를 켰을 때, 열심히 키운 최신 클라우드 데이터가 덮어씌워지는 "좀비 오버라이드" 현상 차단.*

---

## 동기화 시점 (Triggers)

| 시점 | 동작 | 상세 로직 | 파일 위치 |
|------|------|-----------|-----------|
| **상태 변경** | **Auto-Save (L2)** | `useDebounce(state, 1000ms)` 훅에 의해 1초 뒤 자동 로컬 저장. | `NurturingContext.tsx` |
| **로그인** | D1 ⚡ localStorage | `fetchUserData` 호출. "진행도 우선 법칙"으로 병합. | `NurturingContext.tsx:223-279` |
| **로그아웃** | localStorage → D1 | `saveToCloud` 호출. 즉시 동기화 후 로그아웃. | `SettingsMenu.tsx:131-143` |
| **자동 저장** | localStorage → D1 | 15분 주기. (변경 사항 없으면 Skip) | `NurturingContext.tsx:287-302` |
| **진화/생성** | localStorage → D1 | 중요 이벤트 발생 시 즉시 업로드. | `NurturingContext.tsx` |
| **게임 클리어** | **Force-Save (L2)** | **즉시 저장 (Sync)**. 빠른 페이지 이동 시 데이터 유실 방어. | `NurturingContext.tsx:282` |

---

## 데이터 흐름 (Data Flow)

```mermaid
graph TD
    UserAction[유저 행동 (밥주기/구매)] --> StateUpdated[React State 갱신]
    StateUpdated --> Monitor[useDebounce (1초 대기)]
    Monitor -->|변경 감지| LocalSave[localStorage 저장 (L2)]
    
    LocalSave -.->|15분 경과| CloudSync[D1 업로드 (L3)]
    LocalSave -.->|로그아웃| CloudSync
    
    CloudSync -->|충돌 발생| CheckProgress{진행도 비교}
    CheckProgress -->|Server XP/Money > Local| ServerWins[서버 데이터 채택]
    CheckProgress -->|Local Time > Server| LocalWins[로컬 데이터 채택]
```

### 신규 유저 온보딩 (New User Flow)
신규 유저(D1에 데이터 없음)의 경우, 로컬 데이터 상태에 따라 두 가지로 분기합니다:
1.  **Guest Promotion Strategy** (`hasCharacter: true`):
    *   **Goal**: 게스트 유저가 키우던 펫 데이터를 회원가입 시 그대로 클라우드로 이관.
    *   **Trigger**: 단계 2(Stage 2) 진화 시도 시 `SignupPromoModal` 강제 노출 (게스트는 2단계 진화 불가).
    *   **Migration**: 
        *   회원가입 직후 `migrateGuestToCloud()` 실행.
        *   로컬의 Guest Data를 읽어와 로그인된 User ID의 클라우드 스토리지로 전송.
        *   성공 시 로컬 Guest Data 삭제.
2.  **Fresh Start** (`hasCharacter: false`):
    *   게스트 기록이 없으면 **완전히 초기화된 상태**로 시작합니다.
    *   동작: `Create Default State` + `Sync to Cloud` + `Overwrite Local (User ID)`

---

## 젤로 데이터 관리 상세 (Jello Data Management)

### 1. 주요 데이터 필드
모든 데이터는 `NurturingPersistentState` 객체 하나로 관리되며, 아래 필드들은 **Null Safety(안전 병합)** 처리가 되어 있습니다.

| 필드명 | 설명 | 중요도 | 보호 전략 |
|--------|------|--------|-----------|
| `gro` | 보유 재화 (Money) | ⭐⭐⭐⭐⭐ | **Wallet Protection**: 클라우드의 `totalCurrencyEarned`가 더 높으면 로컬 무시. |
| `xp` | 경험치 | ⭐⭐⭐⭐⭐ | **Progress Protection**: 클라우드의 `xp`가 더 높으면 로컬 무시. |
| `inventory` | 보유 아이템 목록 | ⭐⭐⭐⭐ | `null`일 경우 빈 배열 `[]` 로 복구. |
| `currentHouseId` | 장착 중인 집 | ⭐⭐⭐ | 2중 백업 (`game_data` 내부 + `current_house_id` 컬럼). 복원 시 둘 다 체크. |
| `characterName` | 젤로 이름 | ⭐⭐⭐ | `undefined`일 경우 기본값 'Jello' 복구. |
| `speciesId` | 캐릭터 종족 | ⭐⭐⭐⭐ | 진화 단계와 일치하지 않으면 자동 보정. |

### 2. 이중 안전장치 (Fail-Safe)
데이터 유실을 막기 위해 2가지 강력한 장치가 작동합니다.

1.  **Throttled Local Persistence (`useDebounce`)**:
    *   사용자가 아이템을 사거나 밥을 주면, 1초 뒤 `localStorage`에 무조건 저장됩니다. (L2 계층)
    *   **효과**: 밥 주고 바로 새로고침해도 데이터가 유지됩니다. (기존 "유령 저장소" 문제 해결)

2.  **Total Currency Check**:
    *   `xp`가 변하지 않는 만렙 유저의 재화 보호를 위해, `totalCurrencyEarned`(누적 획득 재화)를 별도로 기록합니다.
    *   **효과**: 레벨 변동 없이 돈만 벌었을 때도 클라우드 데이터가 우선순위를 가집니다.

3.  **Star Protection Protocol (별 개수 보호 - 2026.01.27)**:
    *   **문제**: 타임스탬프 갱신 누락 등으로 인해, 별을 획득한 최신 로컬 데이터가 별이 없는 구버전 클라우드 데이터로 덮어씌워지는 현상 발생.
    *   **해결**: 충돌 해결(Conflict Resolution) 로직에 **"별 개수 비교"**를 추가.
    *   **Rule**: `IF (Local.Stars >= Cloud.Stars) THEN Trust Local` (시간/재화 조건보다 우선)
    *   **필수 구현**: 점수 기록 시(`recordGameScore`) 반드시 `lastActiveTime`을 `Date.now()`로 갱신하여 로컬 데이터의 최신성을 보장해야 함.

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


### Fail-Safe Integrity Check (2026.01.27 Updates)
데이터 무결성 검증을 위해 `simpleEncryption.ts`에서 Checksum을 사용합니다.

#### 1. Robust Checksum (v2)
- **기존**: `JSON.stringify(entireObject)` -> 키 순서가 바뀌면 체크섬 불일치로 데이터 초기화 (오판 가능성 높음)
- **개선**: `hash(_enc + "|" + (lastActiveTime || 0))` -> **핵심 암호화 문자열(`_enc`)**과 **타임스탬프**만 검증.
- **안전장치**: `lastActiveTime`이 없거나 `NaN`일 경우 `0`으로 처리하여 계산 일관성 보장.

#### 2. Self-Healing Mechanism (자가 치유)
- **문제**: 배포로 인해 체크섬 로직이 변경되거나(v1 -> v2), 저장 타이밍 이슈로 인해 디스크의 실제 데이터와 체크섬이 일시적으로 불일치하는 경우, 기존 로직은 "해킹"으로 간주하여 데이터를 즉시 초기화했습니다.
- **해결**: 불일치 감지 시 **"체크섬 키(`puzzleletic_checksum`)"를 삭제**하고 데이터를 그대로 로드(Legacy Mode)합니다.
- **효과**: 
    - 오탐(False Alarm)으로 인한 선량한 유저의 데이터 초기화/손실 방지.
    - 다음 자동 저장 시 새로운 로직으로 정상 체크섬이 생성되어 시스템이 스스로 정상화됨.

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

