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

| 시점 | 동작 | 상세 로직 |
|------|------|-----------|
| **상태 변경** | **Auto-Save (L2)** | `useDebounce(state, 1000ms)` 훅에 의해 1초 뒤 자동 로컬 저장. |
| **로그인** | D1 ⚡ localStorage | `fetchUserData` 호출. "진행도 우선 법칙"으로 병합. |
| **로그아웃** | localStorage → D1 | `saveToCloud` 호출. 즉시 동기화 후 로그아웃. |
| **자동 저장** | localStorage → D1 | 15분 주기. (변경 사항 없으면 Skip) |
| **진화/생성** | localStorage → D1 | 중요 이벤트 발생 시 즉시 업로드. |

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
    *   사용자가 아이템을 사거나 밥을 주면, 1초 뒤 `localStorage`에 무조건 저장됩니다.
    *   **효과**: 밥 주고 바로 새로고침해도 데이터가 유지됩니다. (기존 "유령 저장소" 문제 해결)

2.  **Total Currency Check**:
    *   `xp`가 변하지 않는 만렙 유저의 재화 보호를 위해, `totalCurrencyEarned`(누적 획득 재화)를 별도로 기록합니다.
    *   **효과**: 레벨 변동 없이 돈만 벌었을 때도 클라우드 데이터가 우선순위를 가집니다.

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

---

## 레거시 호환성 (Migration)
*   **minigameStats**: 구버전 미니게임 통계는 `gameScores` 압축 포맷으로 자동 변환됩니다.
*   **undefined**: D1에서 `undefined`를 지원하지 않아 발생하는 `null` 문제는 `restoreState`의 **Safe Merge** 로직(`??` 연산자)이 방어합니다.

---

## D1 스키마 구조
`game_data` JSON 필드가 **유일한 진실의 원천(Source of Truth)**입니다.
`level`, `xp`, `gro` 등의 별도 컬럼은 오직 **관리자 통계 및 랭킹 쿼리용**이며, 게임 로직은 이 컬럼을 읽지 않고 `game_data`를 파싱하여 사용합니다.

| 필드 | 용도 | 신뢰도 |
|------|------|--------|
| `game_data` (JSON) | 게임 상태 복원 | **Primary (100%)** |
| `level`, `xp`, `gro` (Column) | 랭킹/통계 조회 | Secondary (통계용) |
| `current_house_id` (Column) | 디버깅/백업 | Fallback (복구용) |

---

## 요약
> **"로컬은 1초마다 저장하고, 서버는 더 많이 진행한 기록을 믿는다."**

이 원칙을 통해 네트워크 불안정, 앱 강제 종료, 기기 간 충돌 상황에서도 **젤로의 성장 데이터(XP, 재화)**를 완벽하게 보호합니다.
