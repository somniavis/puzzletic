# 양육 시스템 (Nurturing System)

Puzzleletic 프로젝트에 구현된 다마고치 스타일의 양육 시스템 문서입니다.

## 📋 목차

1. [시스템 개요](#시스템-개요)
2. [핵심 메커니즘](#핵심-메커니즘)
3. [스탯 시스템](#스탯-시스템)
4. [행동 시스템](#행동-시스템)
5. [파일 구조](#파일-구조)
6. [사용법](#사용법)

---

## 시스템 개요

### 기본 컨셉

**1분(60초) = 1 로직 틱(Logic Tick)**

- 모든 계산은 1분 간격으로 실행됩니다
- 실시간(온라인): 1분마다 자동으로 스탯이 갱신됩니다
- 오프라인(따라잡기): 접속 시 경과 시간을 계산하여 누적 적용합니다

### 핵심 특징

- ✅ **자동 스탯 감소**: 시간이 지남에 따라 포만감, 청결도, 행복도가 자동으로 감소
- ✅ **상호 악화 시스템**: 특정 스탯이 임계값 이하로 떨어지면 다른 스탯에도 영향
- ✅ **똥 시스템**: 음식을 먹으면 확률적으로 똥을 싸며, 청소하지 않으면 페널티
- ✅ **학습 시스템**: 컨디션이 좋아야 학습 가능하며, 재화를 획득
- ✅ **오프라인 진행**: localStorage에 저장되어 접속하지 않은 시간도 계산됨

---

## 핵심 메커니즘

### 1. 로직 틱 시스템

```typescript
// 1분(60초)마다 1회 실행
const TICK_INTERVAL_MS = 60000;

// 매 틱마다 실행되는 로직:
1. 자연 감소 적용
2. 상태 평가 (배고픔, 더러움, 아픔)
3. 상호 악화 페널티 적용
4. 똥 방치 페널티 적용
5. 스탯 범위 제한 (0-100)
```

### 2. 자연 감소 (Natural Decay)

매 틱마다 아무것도 하지 않아도 다음과 같이 감소합니다:

```typescript
포만감:   -0.8/5초  (약 10분에 100 → 0, 가장 빠름)
행복도:   -0.3/5초  (약 27분에 100 → 0)
건강:     -0.04/5초 (약 200분에 100 → 0, 매우 느린 자연 감소)
```

### 3. 상호 악화 (Vicious Cycle)

#### 배고픔 상태

**심각한 배고픔 (포만감 < 20):**
```
행복도 -1.2/5초  "배고파서 기분이 안 좋아..."
건강 -1.0/5초    "배고파서 힘이 없어..."
```

**경미한 배고픔 (포만감 20~40):**
```
행복도 -0.6/5초
건강 -0.5/5초
```

#### 아픔 상태 (건강 < 50)

```
행복도 -1.5/5초  "너무 아파서 아무것도 하기 싫어..."

⚠️ 중요: 아픔 상태가 되면 약으로만 회복 가능!
```

#### 불행 상태 (행복도 < 20)

```
건강 -0.5/5초    "스트레스로 인한 건강 감소"
```

#### 똥 방치 페널티

```
똥 1개: 건강 -0.5/5초, 행복도 -0.4/5초
똥 2개: 건강 -1.0/5초, 행복도 -0.8/5초
똥 3개+: 건강 -2.0/5초, 행복도 -1.2/5초

최대 똥 개수: 5개
```

---

## 스탯 시스템

### 3대 핵심 지수

| 스탯 | 범위 | 설명 |
|------|------|------|
| **포만감** (Fullness) | 0-100 | 100: 배부름, 0: 굶주림 |
| **건강** (Health) | 0-100 | 100: 최상, 0: 죽음 임박 (청결도 + 질병 통합) |
| **행복도** (Happiness) | 0-100 | 100: 행복, 0: 우울/삐짐 |

> ⚠️ **변경사항**: 청결도가 건강에 통합되었습니다. 건강은 청결(청소, 똥)과 질병(약)을 모두 관리합니다.

### 스탯 상태 레벨

```typescript
0-20:   Critical   (위험)   🔴
20-50:  Warning    (주의)   🟠
50-80:  Normal     (보통)   🟢
80-100: Excellent  (최상)   ✨
```

---

## 행동 시스템

### 1. 음식 먹이기 (Feed)

**주요 효과:**

```
포만감 +10 (모든 음식 동일)
행복도 +10 (먹는 즐거움)
```

**건강식 보너스 (과일):**

```
사과/바나나: 건강 +5
수박: 건강 +3
```

**부작용:**

```
똥 생성 확률 (음식별 0.2 ~ 0.8)
똥 발생 시 건강 즉시 -5 ~ -12
```

**똥 시스템:**

- 똥은 화면에 시각적으로 표시됩니다 (💩)
- 클릭하여 개별적으로 제거 가능
- 청소 버튼으로 모든 똥 일괄 제거
- 방치 시 매 틱마다 모든 스탯 감소

### 2. 약 먹이기 (Medicine)

**주요 효과:**

```
건강 +15 (모든 약 동일)
행복도 -5 (약은 맛없어서 불행)
```

**특수 규칙:**

```
⚠️ 건강 < 50 (아픔 상태)일 때는 약으로 가장 효과적으로 회복 가능
   음식(건강식 +3~5)이나 청소(+5)보다 빠른 회복
```

### 3. 청소하기 (Clean)

**주요 효과:**

```
건강 +5 (환경 개선으로 건강 증가)
행복도 +10 (깨끗해져서 기분이 좋아짐)
모든 똥 제거
```

**부작용:** 없음 (순수하게 긍정적인 행동)

### 4. 놀이하기 (Play)

**주요 효과:**

```
행복도 +20 (놀이를 통한 즐거움)
```

**비용(부작용):**

```
포만감 -10 (에너지 소모)
```

### 5. 학습하기 (Study) ⭐ 핵심 시스템

**필수 조건:**

```
행복도 >= 30
건강 >= 30
포만감 >= 20
```

**주요 효과:**

```
행복도 +20 (학습을 통한 성취감)
재화 획득 +10 (기본)
```

**보너스:**

```
모든 스탯 >= 80일 때: 재화 2배 (+20)
```

**비용(부작용):**

```
포만감 -10 (에너지 소모)
```

**게임 루프의 핵심:**

```
학습(재화 획득) → 스탯 감소(비용) → 재화로 아이템 구매 → 스탯 회복 → 더 효율적인 학습
```

---

## 파일 구조

```
src/
├── types/
│   └── nurturing.ts                 # 양육 시스템 타입 정의
│
├── constants/
│   └── nurturing.ts                 # 상수 (틱 간격, 감소율, 효과값)
│
├── services/
│   ├── gameTickService.ts          # 로직 틱 시스템
│   ├── actionService.ts            # 행동 처리 (먹이기, 청소 등)
│   └── persistenceService.ts       # 저장/로드 (localStorage)
│
├── contexts/
│   └── NurturingContext.tsx        # 전역 상태 관리 (Context API)
│
└── components/
    ├── Poop/
    │   ├── Poop.tsx                # 똥 컴포넌트
    │   └── Poop.css
    ├── NurturingStat/
    │   ├── NurturingStat.tsx       # 개별 스탯 표시
    │   └── NurturingStat.css
    ├── NurturingPanel/
    │   ├── NurturingPanel.tsx      # 통합 스탯 패널
    │   └── NurturingPanel.css
    └── PetRoom/
        ├── PetRoom.tsx             # 메인 게임 화면 (양육 시스템 통합)
        └── PetRoom.css
```

---

## 사용법

### 1. Provider 설정 (App.tsx)

```tsx
import { NurturingProvider } from './contexts/NurturingContext';

function App() {
  return (
    <NurturingProvider>
      {/* 나머지 앱 컴포넌트 */}
    </NurturingProvider>
  );
}
```

### 2. 컴포넌트에서 사용

```tsx
import { useNurturing } from '../../contexts/NurturingContext';

function MyComponent() {
  const nurturing = useNurturing();

  // 스탯 접근
  const { stats, poops, condition } = nurturing;
  console.log(stats.fullness); // 0-100

  // 행동 실행
  const handleFeed = () => {
    const result = nurturing.feed('apple');
    if (result.success) {
      console.log('먹이기 성공!', result.statChanges);
    }
  };

  const handleStudy = () => {
    const result = nurturing.study();
    if (!result.success) {
      console.log('학습 불가:', result.message);
    }
  };

  // 똥 클릭
  const handlePoopClick = (poopId: string) => {
    nurturing.clickPoop(poopId);
  };
}
```

### 3. UI 컴포넌트 사용

```tsx
import { NurturingPanel } from './components/NurturingPanel/NurturingPanel';
import { Poop } from './components/Poop/Poop';

function GameRoom() {
  const { poops } = useNurturing();

  return (
    <>
      {/* 스탯 패널 */}
      <NurturingPanel />

      {/* 똥 렌더링 */}
      {poops.map((poop) => (
        <Poop key={poop.id} poop={poop} onClick={handlePoopClick} />
      ))}
    </>
  );
}
```

---

## 밸런스 조정

### 틱 간격 변경

```typescript
// src/constants/nurturing.ts
export const TICK_INTERVAL_MS = 60000; // 1분
// export const TICK_INTERVAL_MS = 30000; // 30초로 변경 가능
```

### 감소율 조정

```typescript
// src/constants/nurturing.ts
export const NATURAL_DECAY = {
  fullness: -0.5,      // 값 조정 가능
  cleanliness: -0.25,
  happiness: -0.2,
  health: 0,
};
```

### 임계값 조정

```typescript
// src/constants/nurturing.ts
export const THRESHOLDS = {
  HUNGER: 30,        // 배고픔 상태 기준
  DIRTY: 20,         // 더러움 상태 기준
  SICK: 50,          // 아픔 상태 기준
};
```

---

## 게임 플레이 가이드

### 선순환 (Virtuous Cycle)

```
1. 모든 스탯을 80 이상으로 유지
2. 학습 실행 (재화 +20)
3. 획득한 재화로 음식/아이템 구매
4. 스탯 회복 후 다시 학습
```

### 악순환 (Vicious Cycle)

```
1. 방치
2. 청결도/포만감 하락
3. 건강 하락 (아픔)
4. 행복도 급락
5. 학습 불가능
6. 재화 획득 불가
7. 아이템 구매 불가
8. 사망
```

### 우선순위

```
1. 건강 < 50: 즉시 약 먹이기 ⚠️
2. 똥 3개 이상: 청소하기 (건강 감소 방지)
3. 포만감 < 30: 음식 먹이기
4. 행복도 < 20: 놀이하기 (건강 감소 방지)
5. 모든 스탯 안정 시: 학습하여 재화 획득
```

---

## 저장 시스템

### localStorage 키

```
puzzleletic_nurturing_state
```

### 저장 내용

```typescript
{
  stats: NurturingStats,
  poops: Poop[],
  lastActiveTime: number,
  tickConfig: GameTickConfig,
  totalCurrencyEarned: number,
  studyCount: number
}
```

### 오프라인 진행

```
접속 시 자동으로 계산:
1. (현재 시간 - 마지막 접속 시간) / 1분 = N틱
2. N회만큼 로직 틱 순차 실행
3. 최종 스탯 적용
```

---

## 향후 확장 가능성

- [ ] 다양한 음식/약 아이템 추가
- [ ] 진화 시스템과 연동 (특정 스탯 조건 충족 시 진화)
- [ ] 미니게임 추가 (학습 시 플레이)
- [ ] 서버리스 연동 (재화 시스템)
- [ ] 친구 시스템 (다른 유저 캐릭터 방문)
- [ ] 업적/도전과제 시스템
- [ ] 캐릭터별 고유 능력치

---

## 라이센스

이 양육 시스템은 Puzzleletic 프로젝트의 일부입니다.
