# 양육 로직 상세 문서 (Nurturing Logic Documentation)

> 버전: 1.0.0
> 최종 업데이트: 2025-11-15
> 작성자: Claude Code

---

## 📋 목차

1. [시스템 개요](#시스템-개요)
2. [로직 틱 시스템](#로직-틱-시스템)
3. [스탯 시스템](#스탯-시스템)
4. [자연 감소 로직](#자연-감소-로직)
5. [상호 악화 로직](#상호-악화-로직)
6. [행동 시스템](#행동-시스템)
7. [똥 시스템](#똥-시스템)
8. [오프라인 진행](#오프라인-진행)
9. [밸런스 조정 가이드](#밸런스-조정-가이드)
10. [업데이트 히스토리](#업데이트-히스토리)

---

## 시스템 개요

### 핵심 컨셉

Puzzleletic의 양육 시스템은 **다마고치 스타일**의 실시간 케어 게임입니다.

**기본 원리:**
```
5초 = 1 로직 틱 (Logic Tick)
매 틱마다 자동으로 스탯이 감소
일정 임계값 이하로 떨어지면 다른 스탯에도 악영향
적절한 행동(먹이기, 청소, 놀이)으로 스탯 회복
```

**게임 루프:**
```
케어 필요 → 행동 수행 → 스탯 회복 → 학습/놀이 → 재화 획득
→ 시간 경과 → 스탯 감소 → 케어 필요 (반복)
```

---

## 로직 틱 시스템

### 설정값

**파일 위치:** `src/constants/nurturing.ts`

```typescript
export const TICK_INTERVAL_MS = 5000; // 5초 = 1 로직 틱
```

### 동작 방식

1. **실시간 (온라인):**
   ```
   페이지 접속 → 5초마다 자동으로 틱 실행 → 스탯 갱신
   ```

2. **오프라인 (따라잡기):**
   ```
   페이지 재접속 → (현재 시간 - 마지막 접속 시간) / 5초 = N틱
   → N회 틱 로직 순차 실행 → 최종 스탯 적용
   ```

### 틱 실행 순서

**서비스:** `src/services/gameTickService.ts` - `executeGameTick()`

```typescript
function executeGameTick() {
  // 1. 기본 감소 적용
  포만감 -= 0.8
  청결도 -= 0.4
  행복도 -= 0.3
  건강 -= 0 (자연 감소 없음)

  // 2. 상태 평가
  isHungry = 포만감 < 30
  isDirty = 청결도 < 20
  isSick = 건강 < 50

  // 3. 상호 악화 페널티 적용
  if (isHungry) {
    행복도 -= 0.8
    건강 -= 0.6
  }
  if (isDirty) {
    행복도 -= 0.7
    건강 -= 1.2
  }
  if (isSick) {
    행복도 -= 1.5
    포만감 -= 0.7
  }

  // 4. 똥 페널티 (1개당)
  for each poop {
    건강 -= 0.5
    행복도 -= 0.4
    청결도 -= 0.8
  }

  // 5. 범위 제한 (0-100)
  모든 스탯을 0-100 사이로 클램핑

  // 6. 결과 반환
  return { statChanges, condition, penalties, alerts }
}
```

---

## 스탯 시스템

### 4대 핵심 지수

| 스탯 | 영문 | 범위 | 초기값 | 설명 |
|------|------|------|--------|------|
| **포만감** | Fullness | 0-100 | 80 | 100: 배부름, 0: 굶주림 |
| **건강** | Health | 0-100 | 100 | 100: 최상, 0: 죽음 임박 |
| **청결도** | Cleanliness | 0-100 | 90 | 100: 깨끗함, 0: 더러움 |
| **행복도** | Happiness | 0-100 | 70 | 100: 행복, 0: 우울/삐짐 |

### 스탯 상태 레벨

```typescript
// src/services/gameTickService.ts - getStatState()
function getStatState(value: number) {
  if (value < 20)  return 'critical';   // 🔴 위험
  if (value < 50)  return 'warning';    // 🟠 주의
  if (value < 80)  return 'normal';     // 🟢 보통
  return 'excellent';                   // ✨ 최상
}
```

### 임계값 (Thresholds)

```typescript
// src/constants/nurturing.ts
export const THRESHOLDS = {
  HUNGER: 30,    // 배고픔 상태
  DIRTY: 20,     // 더러움 상태
  SICK: 50,      // 아픔 상태
  CRITICAL: 20,  // 위험
  WARNING: 50,   // 주의
  GOOD: 80,      // 양호
};
```

---

## 자연 감소 로직

### 감소율 설정

**파일:** `src/constants/nurturing.ts`

```typescript
// 5초(1틱)당 감소량
export const NATURAL_DECAY = {
  fullness: -0.8,      // 포만감 (가장 빠름)
  cleanliness: -0.4,   // 청결도
  happiness: -0.3,     // 행복도
  health: 0,           // 자연 감소 없음
};
```

### 시간별 감소 시뮬레이션

| 시간 | 포만감 | 청결도 | 행복도 |
|------|--------|--------|--------|
| 0분 | 100 | 100 | 100 |
| 5분 | 52 | 76 | 82 |
| 10분 | 4 | 52 | 64 |
| 15분 | 0 (위험) | 28 | 46 |
| 20분 | 0 | 4 | 28 |
| 25분 | 0 | 0 | 10 |
| 30분 | 0 | 0 | 0 (모두 0) |

**결론:**
- 포만감은 약 10분에 0 도달 (가장 긴급)
- 청결도는 약 20분에 0 도달
- 행복도는 약 27분에 0 도달

---

## 상호 악화 로직

### Vicious Cycle (악순환)

스탯이 임계값 이하로 떨어지면 다른 스탯에 추가 페널티를 부여합니다.

#### 1. 배고픔 상태 (Hunger)

**조건:** `포만감 < 30`

```typescript
// src/constants/nurturing.ts
export const HUNGER_PENALTY = {
  happiness: -0.8,  // 5초당 0.8 감소
  health: -0.6,     // 5초당 0.6 감소
};
```

**효과:**
- 행복도가 빠르게 하락 ("배고파서 기분이 안 좋아...")
- 건강도 서서히 하락 ("배고파서 힘이 없어...")
- **시간:** 약 2분이면 건강 50 이하 (아픔 상태)

#### 2. 더러움 상태 (Dirty)

**조건:** `청결도 < 20`

```typescript
export const DIRTY_PENALTY = {
  happiness: -0.7,  // 5초당 0.7 감소
  health: -1.2,     // 5초당 1.2 감소 (가장 치명적)
};
```

**효과:**
- 건강에 **가장 치명적**인 페널티 ("질병의 주된 원인")
- 행복도도 빠르게 하락 ("몸이 찝찝하고 불쾌해...")
- **시간:** 약 1.5분이면 건강 50 이하 (아픔 상태)

#### 3. 아픔 상태 (Sick)

**조건:** `건강 < 50`

```typescript
export const SICK_PENALTY = {
  happiness: -1.5,  // 5초당 1.5 감소 (최대)
  fullness: -0.7,   // 5초당 0.7 감소
};
```

**효과:**
- 행복도 **급격히** 하락 ("너무 아파서 아무것도 하기 싫어...")
- 포만감도 추가로 하락 ("아파서 소화가 안돼...")
- ⚠️ **중요:** 아픔 상태가 되면 **약으로만** 건강 회복 가능!

#### 4. 똥 방치 (Poop Penalty)

**조건:** 똥이 1개 이상 있을 때

```typescript
// 똥 1개당 5초마다
export const POOP_PENALTY_PER_ITEM = {
  health: -0.5,
  happiness: -0.4,
  cleanliness: -0.8,
};
```

**효과:**
- 똥 개수에 비례하여 페널티 누적
- 예: 똥 3개 → 건강 -1.5, 행복도 -1.2, 청결도 -2.4 (5초당)
- **시간:** 똥 2개만 있어도 약 1분이면 청결도 < 20 (더러움 상태)

### 악순환 시나리오

```
1단계: 포만감 하락 (10분 방치)
  ↓ 포만감 < 30 (배고픔 상태)

2단계: 배고픔 페널티 발생
  ↓ 건강 & 행복도 감소 시작

3단계: 청결도 하락 + 똥 발생
  ↓ 청결도 < 20 (더러움 상태)

4단계: 더러움 페널티 발생 (치명적)
  ↓ 건강 급격히 하락

5단계: 건강 < 50 (아픔 상태)
  ↓ 아픔 페널티 발생 (최악)

6단계: 모든 스탯 급락
  ↓ 학습 불가능
  ↓ 재화 획득 불가
  ↓ 회복 불가
  ↓ 사망
```

---

## 행동 시스템

### 1. 음식 먹이기 (Feed)

**파일:** `src/services/actionService.ts` - `feedCharacter()`

**효과:**
```typescript
주요 효과:
  포만감: +[음식별] (예: 사과 +20, 피자 +60)
  행복도: +5 (먹는 즐거움)

부작용:
  똥 생성: 확률적 (음식별 0.2 ~ 0.8)
  청결도: -5 ~ -12 (똥 발생 시)
```

**음식별 효과:**

| 음식 | 포만감 | 행복도 | 똥 확률 | 청결도 감소 |
|------|--------|--------|---------|-------------|
| 사과 | +20 | +5 | 30% | -5 |
| 바나나 | +25 | +7 | 40% | -5 |
| 수박 | +30 | +10 | 50% | -7 |
| 식사 | +50 | +5 | 70% | -10 |
| 피자 | +60 | +15 | 80% | -12 |
| 간식 | +15 | +10 | 20% | -3 |
| 케이크 | +40 | +20 | 60% | -8 |

**전략:**
- 긴급: 식사/피자 (포만감 빠르게 회복)
- 유지: 과일 (조금씩 자주)
- 행복: 케이크/간식 (행복도 보너스)

### 2. 약 먹이기 (Medicine)

**파일:** `src/services/actionService.ts` - `giveMedicine()`

**효과:**
```typescript
주요 효과:
  건강: +[약별] (예: 반창고 +10, 항생제 +40)
  행복도: +10 (안도감)

부작용:
  없음 (순수 회복)
```

**약별 효과:**

| 약 | 건강 | 행복도 | 비고 |
|----|------|--------|------|
| 반창고 | +10 | +10 | 경미한 상처 |
| 항생제 | +40 | +10 | 질병 치료 |
| 건강 포션 | +60 | +15 | 긴급 회복 |

**중요 규칙:**
```
⚠️ 건강 < 50 (아픔 상태)일 때:
   - 음식으로는 건강 회복 불가
   - 청소로도 건강 회복 불가
   - 오직 약으로만 회복 가능!
```

### 3. 청소하기 (Clean)

**파일:** `src/services/actionService.ts` - `cleanRoom()`

**효과:**
```typescript
주요 효과:
  청결도: +40
  행복도: +5

보너스:
  똥 1개당 행복도 +2 추가
  모든 똥 제거

부작용:
  없음
```

**애니메이션:**
- 빗자루 🧹가 각 똥을 순차적으로 쓸어냄
- 100ms 간격으로 순차 청소
- 똥이 회전하며 사라짐

### 4. 놀이하기 (Play)

**파일:** `src/services/actionService.ts` - `playWithCharacter()`

**효과:**
```typescript
주요 효과:
  행복도: +20

비용 (부작용):
  포만감: -10
  청결도: -5
```

**용도:**
- 행복도가 낮을 때
- 학습 전 컨디션 조절

### 5. 학습하기 (Study) ⭐

**파일:** `src/services/actionService.ts` - `studyWithCharacter()`

**필수 조건:**
```typescript
export const STUDY_REQUIREMENTS = {
  MIN_HAPPINESS: 30,
  MIN_HEALTH: 30,
  MIN_FULLNESS: 20,
};
```

**효과:**
```typescript
주요 효과:
  행복도: +20
  재화: +10 (기본)

보너스:
  모든 스탯 >= 80: 재화 2배 (+20)

비용:
  포만감: -10
  청결도: -5
```

**게임 루프의 핵심:**
```
학습 → 재화 획득 → 스탯 소모
  ↓
아이템 구매 (재화 사용)
  ↓
스탯 회복
  ↓
더 효율적인 학습 (보너스)
  ↓
반복 (선순환)
```

---

## 똥 시스템

### 생성 로직

**파일:** `src/services/actionService.ts` - `tryCreatePoop()`

```typescript
function tryCreatePoop(foodEffect, existingPoops) {
  // 1. 최대 개수 체크
  if (existingPoops.length >= 5) return undefined;

  // 2. 확률 체크
  if (Math.random() > foodEffect.poopChance) return undefined;

  // 3. 랜덤 위치 생성
  x: 10% ~ 90%
  y: 30% ~ 90%

  // 4. 똥 생성
  return {
    id: unique,
    x, y,
    createdAt: timestamp,
    cleanlinessDebuff: -5 ~ -12
  };
}
```

### 페널티

**설정:** `src/constants/nurturing.ts`

```typescript
// 똥 1개당 5초마다
export const POOP_PENALTY_PER_ITEM = {
  health: -0.5,
  happiness: -0.4,
  cleanliness: -0.8,
};

export const POOP_CONFIG = {
  INITIAL_CLEANLINESS_DEBUFF: -10,  // 발생 즉시
  MAX_POOPS: 5,                     // 최대 5개
};
```

### 청소 방법

1. **개별 클릭:**
   - 똥을 직접 클릭
   - 빗자루 애니메이션
   - 400ms 후 제거

2. **청소 버튼:**
   - 하단 🧹 버튼 클릭
   - 모든 똥 순차 청소 (100ms 간격)
   - 스탯 증가 + 보너스

---

## 오프라인 진행

### 저장 시스템

**파일:** `src/services/persistenceService.ts`

**저장 키:**
```typescript
const STORAGE_KEY = 'puzzleletic_nurturing_state';
```

**저장 데이터:**
```typescript
interface NurturingPersistentState {
  stats: NurturingStats;           // 현재 스탯
  poops: Poop[];                   // 똥 목록
  lastActiveTime: number;          // 마지막 활동 시간
  tickConfig: GameTickConfig;      // 틱 설정
  totalCurrencyEarned: number;     // 총 재화
  studyCount: number;              // 학습 횟수
}
```

### 따라잡기 로직

**파일:** `src/services/persistenceService.ts` - `applyOfflineProgress()`

```typescript
function applyOfflineProgress(state) {
  const currentTime = Date.now();
  const timeElapsed = currentTime - state.lastActiveTime;

  // 1. 틱 개수 계산
  const ticksElapsed = Math.floor(timeElapsed / 5000);

  // 2. 각 틱마다 순차 실행
  for (let i = 0; i < ticksElapsed; i++) {
    executeGameTick(stats, poops);
    // 스탯 업데이트
  }

  // 3. 최종 스탯 반환
  return finalStats;
}
```

**예시:**
```
마지막 접속: 10:00
현재 시간: 10:05 (5분 경과)

틱 개수: (5분 * 60초) / 5초 = 60틱

실행: 60번의 틱 로직 순차 실행
결과: 포만감 약 48 감소, 청결도 약 24 감소, 행복도 약 18 감소
```

---

## 밸런스 조정 가이드

### 틱 간격 변경

**파일:** `src/constants/nurturing.ts`

```typescript
// 현재: 5초
export const TICK_INTERVAL_MS = 5000;

// 더 빠르게 (긴장감 증가):
export const TICK_INTERVAL_MS = 3000; // 3초

// 더 느리게 (여유 증가):
export const TICK_INTERVAL_MS = 10000; // 10초
```

### 감소율 조정

**파일:** `src/constants/nurturing.ts`

```typescript
// 현재 설정 (5초당)
export const NATURAL_DECAY = {
  fullness: -0.8,
  cleanliness: -0.4,
  happiness: -0.3,
  health: 0,
};

// 더 빠른 감소 (어려움):
export const NATURAL_DECAY = {
  fullness: -1.2,    // 약 7분에 0
  cleanliness: -0.6, // 약 14분에 0
  happiness: -0.5,   // 약 17분에 0
  health: 0,
};

// 더 느린 감소 (쉬움):
export const NATURAL_DECAY = {
  fullness: -0.4,    // 약 20분에 0
  cleanliness: -0.2, // 약 40분에 0
  happiness: -0.15,  // 약 55분에 0
  health: 0,
};
```

### 페널티 강도 조정

**파일:** `src/constants/nurturing.ts`

```typescript
// 더 가혹하게 (하드코어):
export const HUNGER_PENALTY = {
  happiness: -1.2,
  health: -1.0,
};
export const DIRTY_PENALTY = {
  happiness: -1.0,
  health: -2.0,  // 매우 치명적
};
export const SICK_PENALTY = {
  happiness: -2.0,
  fullness: -1.0,
};

// 더 관대하게 (이지):
export const HUNGER_PENALTY = {
  happiness: -0.4,
  health: -0.3,
};
export const DIRTY_PENALTY = {
  happiness: -0.4,
  health: -0.6,
};
export const SICK_PENALTY = {
  happiness: -0.8,
  fullness: -0.4,
};
```

### 임계값 조정

**파일:** `src/constants/nurturing.ts`

```typescript
// 현재
export const THRESHOLDS = {
  HUNGER: 30,   // 배고픔 시작
  DIRTY: 20,    // 더러움 시작
  SICK: 50,     // 아픔 시작
};

// 더 일찍 경고 (쉬움):
export const THRESHOLDS = {
  HUNGER: 40,   // 더 높을 때부터 페널티
  DIRTY: 30,
  SICK: 60,
};

// 더 늦게 경고 (어려움):
export const THRESHOLDS = {
  HUNGER: 20,   // 거의 0에 가까워야 페널티
  DIRTY: 10,
  SICK: 40,
};
```

### 행동 효과 조정

**파일:** `src/constants/nurturing.ts`

```typescript
// 음식 효과 증가 (쉬움)
export const FOOD_EFFECTS = {
  apple: {
    fullness: 30,    // 20 → 30
    happiness: 8,    // 5 → 8
    poopChance: 0.2, // 30% → 20%
  },
  // ...
};

// 청소 효과 증가
export const CLEAN_EFFECT = {
  cleanliness: 60,   // 40 → 60
  happiness: 10,     // 5 → 10
};

// 학습 요구사항 완화
export const STUDY_REQUIREMENTS = {
  MIN_HAPPINESS: 20,  // 30 → 20
  MIN_HEALTH: 20,     // 30 → 20
  MIN_FULLNESS: 10,   // 20 → 10
};
```

---

## 업데이트 히스토리

### v1.0.0 (2025-11-15)

**초기 릴리즈**
- 4대 스탯 시스템 구현
- 로직 틱: 5초 간격
- 자연 감소 + 상호 악화 로직
- 똥 시스템 + 빗자루 애니메이션
- 학습 시스템 (재화 획득)
- 오프라인 진행 계산
- localStorage 자동 저장

**밸런스 설정:**
- 포만감: 10분에 0 도달
- 청결도: 20분에 0 도달
- 행복도: 27분에 0 도달
- 페널티: 중간 강도
- 똥: 최대 5개

**변경 이유:**
- 1분 틱은 너무 느림 → 5초로 단축
- 실시간 피드백 필요 → 빠른 감소율 적용
- 긴장감 있는 케어 경험 제공

---

### 향후 계획

#### v1.1.0 (계획중)
- [ ] 난이도 설정 추가 (쉬움/보통/어려움)
- [ ] 스탯별 UI 경고 알림
- [ ] 음식/약 아이템 확장
- [ ] 학습 미니게임 추가

#### v1.2.0 (계획중)
- [ ] 진화 시스템과 연동
- [ ] 특정 스탯 조건 충족 시 진화
- [ ] 진화 단계별 스탯 보너스

#### v2.0.0 (계획중)
- [ ] 서버리스 연동 (재화 시스템)
- [ ] 친구 시스템
- [ ] 업적/도전과제
- [ ] 캐릭터별 고유 능력치

---

## 참고 자료

### 관련 파일

**타입 정의:**
- `src/types/nurturing.ts`

**상수:**
- `src/constants/nurturing.ts`

**서비스:**
- `src/services/gameTickService.ts` - 틱 로직
- `src/services/actionService.ts` - 행동 처리
- `src/services/persistenceService.ts` - 저장/로드

**컨텍스트:**
- `src/contexts/NurturingContext.tsx` - 전역 상태

**컴포넌트:**
- `src/components/Poop/` - 똥 + 애니메이션
- `src/components/PetRoom/PetRoom.tsx` - 메인 게임

### 외부 문서

- [다마고치 위키](https://tamagotchi.fandom.com/)
- [게임 밸런스 가이드](https://www.gamasutra.com/view/feature/134768/understanding_balance_in_video_.php)

---

**문서 버전:** 1.0.0
**마지막 업데이트:** 2025-11-15
**작성자:** Claude Code
**라이센스:** Puzzleletic Project
