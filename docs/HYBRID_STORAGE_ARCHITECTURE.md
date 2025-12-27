# 하이브리드 데이터 저장 아키텍처

> 마지막 업데이트: 2025-12-27

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
| **로그인** | D1 → localStorage (D1 신뢰) | `NurturingContext.tsx:223-279` |
| **15분 자동** | localStorage → D1 | `NurturingContext.tsx:287-302` |
| **Save 버튼** | localStorage → D1 | `NurturingContext.tsx:304-309` |
| **로그아웃** | localStorage → D1 | `SettingsMenu.tsx:131-143` |
| **상태 변경** | localStorage만 | 모든 setState 호출 |

---

## 데이터 흐름

```
[상태 변경] ─────────────────────────────> [localStorage] (즉시)
                                                │
                                                │ (15분/Save/로그아웃)
                                                ▼
[로그인] <──────────────────────────────── [Cloudflare D1]
```

### 로그인 시 동작
1. `fetchUserData(user)` 호출
2. D1에서 `game_data` 가져옴
3. D1 데이터로 localStorage 덮어쓰기
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

## 트러블슈팅

### D1_TYPE_ERROR: undefined not supported
- **원인**: payload에 undefined 값 포함
- **해결**: `sanitizeForD1()` 함수로 전체 payload 처리

### 로그인 시 데이터 복원 안 됨
- **확인**: Console에서 `☁️ Cloud data found` 로그 확인
- **원인**: `game_data` 파싱 실패 가능
- **해결**: Worker에서 JSON.stringify/parse 확인

### Save 버튼 실패
- **확인**: Console에서 `☁️ Sync failed:` 에러 메시지 확인
- **일반적 원인**: 네트워크, 토큰 만료, D1 타입 에러
