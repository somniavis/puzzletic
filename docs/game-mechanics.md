# grogrojello: 게임 메카닉스 및 로직 설계서

## 1. 게임 개요 및 핵심 루프 (Game Loop)

**컨셉**: 다회차 육성 및 도감 수집형 에듀테크 게임.

**목표**: 1,000개의 학습 미니게임을 통해 다양한 조건을 만족시켜, 총 10종류(확장가능)의 최종 진화 젤로(Jello)를 모두 수집(졸업)하는 것.

캐릭터가 영원히 사는 것이 아니라, **5단계(성체)가 되면 '졸업(독립)'**을 하고 도감에 등록된 후 떠납니다. 그리고 유저는 다시 **1단계(알)**부터 시작합니다.

### 🔄 사이클 구조 (Cycle)

1. **시작**: 알(Egg)에서 시작
2. **육성**: 양육(상태 관리) + 학습(미니게임) 병행
3. **성장**: 경험치(GP) 축적을 통한 5단계 진화
4. **졸업(Reset)**: 5단계 달성 시 캐릭터는 **도감에 등록되고 떠남**
5. **계승**: 획득한 재화(glo)는 유지한 채 **새로운 알 육성 시작**

---

## 2. 진화 시스템 (Evolution System)

### 🧬 진화 단계 (Lifecycle)

| **단계 (Stage)** | **명칭** | **필요 누적 GP** | **구간 필요 GP** | **예상 플레이 횟수** | **성장 체감** |
| --- | --- | --- | --- | --- | --- |
| **1단계** | 알 | 0 | 0 | - | 시작 |
| **2단계** | 유아기 | **100** | 100 | **10판** | "어? 금방 깨어나네?" (튜토리얼) |
| **3단계** | 아동기 | **500** | 400 | **50판** (누적) | "이제 좀 게임답네." (본격 시작) |
| **4단계** | **청소년기** | **2,000** | 1,500 | **200판** (누적) | **[분기점]** 성향이 결정되는 가장 중요한 시기 |
| **5단계** | **성체 (졸업)** | **5,000** | 3,000 | **500판** (누적) | **[인내심]** 마지막 끈기가 필요한 구간 |

**※ GP 기준**: 판당 10GP 기준 (난이도 3, 정답률 100% 가정)

---

## 3. 보상 시스템 (Rewards & Progression)

### 💰 미니게임 보상 공식

학습 동기 부여를 위해 난이도와 정답률에 따라 보상을 차등 지급합니다.

**공식**: `기본값 × 난이도 계수 × 정답률(0.0~1.0) × 숙련도 보너스 × 퍼펙트 보너스`

| **난이도 (Lv)** | **난이도 계수** | **글로(GLO) (glo)** | **경험치 (GP)** | **특징** |
| --- | --- | --- | --- | --- |
| **Lv 1** | 1.0 | 5 | 3 | 단순 반복 |
| **Lv 2** | 1.5 | 7 | 5 | 기초 응용 |
| **Lv 3** | 2.5 | 10 | 10 | 사고력 필요 |
| **Lv 4** | 4.0 | 20 | 20 | 심화 과정 |
| **Lv 5** | 6.0 | 25 | 40 | 챌린지 (High Risk High Return) |

**퍼펙트 보너스**: 정답률 100% 시 최종 보상 **1.2배**

### 🎮 놀이(Play) 보상

행복도 기반 차등 보상 시스템:

| **행복도** | **보너스 등급** | **글로(GLO)** | **GP** | **배율** |
| --- | --- | --- | --- | --- |
| **≥ 80** | Excellent | 6 | 3 | 2.0x / 1.5x |
| **≥ 65** | Good | 4.5 | 2.6 | 1.5x / 1.3x |
| **≥ 50** | Normal | 3 | 2 | 1.0x / 1.0x |
| **< 50** | - | 0 | 0 | 불가 |

**쿨다운**: 60초 (1분)

---

## 4. 성향 시스템 (Tendency System)

### 📊 6가지 성향

캐릭터의 활동에 따라 성향이 축적되며, 이는 4단계에서 **진화 분기**를 결정합니다.

| **성향** | **영문** | **설명** |
| --- | --- | --- |
| **지능** | Intelligence | 학습 활동으로 증가 |
| **창의성** | Creativity | 고난이도 미니게임으로 증가 |
| **신체** | Physical | 놀이 활동으로 증가 |
| **사회성** | Social | 상호작용(먹이기, 놀이)으로 증가 |
| **규율** | Discipline | 규칙적인 관리(학습, 청소)로 증가 |
| **탐험성** | Exploration | 새로운 시도(고난이도 챌린지)로 증가 |

### 🎯 활동별 성향 증가량

| **활동** | **성향 증가** |
| --- | --- |
| 미니게임 Lv1 | 지능 +1, 규율 +1 |
| 미니게임 Lv2 | 지능 +2, 규율 +1 |
| 미니게임 Lv3 | 지능 +3, 창의성 +1 |
| 미니게임 Lv4 | 지능 +4, 창의성 +2 |
| 미니게임 Lv5 | 지능 +5, 창의성 +3, 탐험성 +2 |
| 놀이 | 신체 +2, 사회성 +1 |
| 청소 | 규율 +1 |
| 먹이기 | 사회성 +1 |

---

## 5. 진화 분기 (Evolution Branching)

### 🌳 10종 젤로 (Jello Species)

4단계(청소년기) 도달 시, **가장 높은 성향 2개의 조합**으로 최종 진화 종류가 결정됩니다.

| **종류** | **주성향** | **부성향** | **설명** |
| --- | --- | --- | --- |
| **Hero** (영웅) | 규율 | 신체 | 규율과 신체를 갖춘 영웅 |
| **Genius** (천재) | 지능 | 창의성 | 지능과 창의성을 갖춘 천재 |
| **Athlete** (운동선수) | 신체 | 규율 | 신체와 규율을 갖춘 운동선수 |
| **Artist** (예술가) | 창의성 | 사회성 | 창의성과 사회성을 갖춘 예술가 |
| **Leader** (리더) | 사회성 | 지능 | 사회성과 지능을 갖춘 리더 |
| **Explorer** (탐험가) | 탐험성 | 신체 | 탐험성과 신체를 갖춘 탐험가 |
| **Healer** (치유사) | 사회성 | 규율 | 사회성과 규율을 갖춘 치유사 |
| **Builder** (건설가) | 규율 | 지능 | 규율과 지능을 갖춘 건설가 |
| **Merchant** (상인) | 사회성 | 창의성 | 사회성과 창의성을 갖춘 상인 |
| **Scholar** (학자) | 지능 | 탐험성 | 지능과 탐험성을 갖춘 학자 |

**분기 조건**:
- 4단계 도달
- 최소 성향 값: **20 이상**
- 가장 높은 성향 2개 조합으로 자동 결정

---

## 6. 졸업 시스템 (Graduation)

### 🎓 졸업 조건

- **5단계(성체) 도달**
- **누적 5000 GP 달성**

### 🏆 졸업 보상

| **항목** | **내용** |
| --- | --- |
| **도감 등록** | 해당 젤로가 도감에 영구 등록 |
| **보너스 글로(GLO)** | 1,000 글로(GLO) 지급 |
| **업적 해금** | 졸업 관련 업적 획득 |

졸업 후:
- 캐릭터는 떠나고 도감에 기록됨
- 글로(GLO)은 유지
- 새로운 알(1단계)로 시작

---

## 7. 도감 시스템 (Pokedex)

### 📖 도감 목표

**총 10종의 젤로를 모두 수집**

### 📝 도감 엔트리 정보

각 졸업한 젤로는 다음 정보가 기록됩니다:

- 종류 (Species)
- 이름 (유저가 지은 이름)
- 도달 단계 (5단계 = 졸업)
- 총 획득 GP
- 총 획득 글로(GLO)
- 총 플레이 게임 수
- 최종 성향 통계
- 졸업 시간
- 특별한 특성

### 🏅 도감 완성 보상

| **보상** | **내용** |
| --- | --- |
| **완성 보너스** | 10,000 글로(GLO) |
| **특별 칭호** | "Master Trainer" |
| **비밀 컨텐츠** | 숨겨진 기능 해금 |

---

## 8. 구현 상태

### ✅ 완료된 구현

#### 파일 구조

```
src/
├── types/
│   ├── gameMechanics.ts        # 게임 메카닉스 타입 정의
│   └── character.ts            # Character 타입에 GP, 글로(GLO) 필드 추가
├── constants/
│   └── gameMechanics.ts        # 진화 단계, 보상, 성향 상수
└── services/
    ├── evolutionService.ts     # 진화 로직 (GP 계산, 분기 결정)
    ├── rewardService.ts        # 보상 계산 (미니게임, 놀이)
    └── actionService.ts        # 놀이 함수에 보상 타입 추가
```

#### 주요 기능

1. **진화 시스템**
   - `calculateEvolutionStage()`: GP로 현재 단계 계산
   - `getGPToNextStage()`: 다음 단계까지 필요 GP
   - `getEvolutionProgress()`: 진행률 계산
   - `canGraduate()`: 졸업 가능 여부
   - `determineJelloSpecies()`: 성향으로 종류 결정

2. **보상 시스템**
   - `calculateMinigameReward()`: 미니게임 보상 계산
   - `calculatePlayReward()`: 놀이 보상 계산
   - `previewRewardByDifficulty()`: 난이도별 예상 보상
   - `checkPlayCooldown()`: 놀이 쿨다운 체크

3. **성향 시스템**
   - `gainTendencyFromMinigame()`: 미니게임으로 성향 증가
   - `gainTendencyFromPlay()`: 놀이로 성향 증가
   - `gainTendencyFromClean()`: 청소로 성향 증가
   - `gainTendencyFromFeed()`: 먹이기로 성향 증가

### 🔜 향후 통합 작업

1. **미니게임 완료 시 보상 적용**
   - 미니게임 결과 → `calculateMinigameReward()` 호출
   - 캐릭터 GP, 글로(GLO) 업데이트
   - 성향 증가
   - 진화 체크

2. **놀이 버튼 통합**
   - `playWithCharacter()` → `calculatePlayReward()` 호출
   - 쿨다운 체크
   - 보상 적용

3. **UI 표시**
   - GP 바 / 진화 단계 표시
   - 글로(GLO) 잔액 표시
   - 성향 그래프
   - 도감 화면

4. **졸업 플로우**
   - 5단계 도달 시 졸업 모달
   - 도감 등록
   - 새 알 생성

---

## 9. 사용 예시

### 미니게임 완료 후 보상 계산

```typescript
import { calculateMinigameReward, gainTendencyFromMinigame } from './services/rewardService';
import { addGPAndCheckEvolution } from './services/evolutionService';

// 미니게임 결과
const result = {
  difficulty: 3,
  accuracy: 0.9, // 90% 정답률
  isPerfect: false,
  masteryBonus: 1.0,
};

// 보상 계산
const reward = calculateMinigameReward(result);
console.log(reward.gloEarned); // 9 글로(GLO)
console.log(reward.gpEarned); // 9 GP

// 캐릭터 업데이트
character.glo += reward.gloEarned;
character.gp += reward.gpEarned;
character.gamesPlayed += 1;

// 성향 증가
character.tendencies = gainTendencyFromMinigame(character.tendencies, 3);

// 진화 체크
const evolutionResult = addGPAndCheckEvolution(
  character.gp - reward.gpEarned,
  character.evolutionStage,
  reward.gpEarned
);

if (evolutionResult.evolved) {
  console.log(`진화! ${evolutionResult.stageInfo?.name}`);
  character.evolutionStage = evolutionResult.newStage;
}
```

### 놀이 보상 계산

```typescript
import { calculatePlayReward, checkPlayCooldown } from './services/rewardService';

// 쿨다운 체크
const cooldown = checkPlayCooldown(character.lastPlayTime);
if (!cooldown.canPlay) {
  console.log(`${cooldown.timeLeft}ms 후 다시 놀 수 있습니다.`);
  return;
}

// 보상 계산
const playReward = calculatePlayReward(character.stats.happiness);
if (playReward.bonus === null) {
  console.log('행복도가 너무 낮아 놀 수 없습니다.');
  return;
}

// 적용
character.glo += playReward.gloEarned;
character.gp += playReward.gpEarned;
character.lastPlayTime = Date.now();
```

### 졸업 체크

```typescript
import { canGraduate, determineJelloSpecies } from './services/evolutionService';

if (canGraduate(character.gp, character.evolutionStage)) {
  // 종류 결정
  const species = determineJelloSpecies(character.tendencies);

  // 도감 등록
  const entry = {
    species,
    name: character.name,
    stageReached: 5,
    totalGPEarned: character.gp,
    totalGloEarned: character.glo,
    totalGamesPlayed: character.gamesPlayed,
    tendencies: character.tendencies,
    graduatedAt: Date.now(),
  };

  // 보너스 글로(GLO) 지급
  playerProgress.totalGlo += 1000;

  // 새 알 생성
  // ...
}
```

---

## 10. 밸런싱 노트

### 진행 속도

- **2단계**: 10게임 (약 10분) - 빠른 피드백
- **3단계**: 50게임 누적 (약 50분) - 게임 본격 이해
- **4단계**: 200게임 누적 (약 3시간) - 분기 결정
- **5단계**: 500게임 누적 (약 8시간) - 한 사이클 완료

### 경제 밸런스

- 졸업 1회당 평균 글로(GLO) 획득: 약 3,000~5,000 글로(GLO)
- 10종 완성 시 총 글로(GLO): 약 40,000~60,000 글로(GLO)
- 글로(GLO) 사용처: 아이템 구매, 스킨 해금 등 (추후 확장)

---

**문서 버전**: 1.0
**최종 수정일**: 2025-11-26
**작성자**: grogrojello 개발팀
