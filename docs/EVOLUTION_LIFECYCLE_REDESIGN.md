# 진화 및 졸업 생애주기 재설계 (Evolution Lifecycle Redesign)

## 목표 (Goal)
복잡하게 얽혀있는 진화/졸업 로직을 "상태 기반(State-Driven)"으로 단순화하고, **모든 애니메이션과 팝업이 반드시 '팻룸(Pet Room)'에 진입했을 때만 실행**되도록 변경합니다.

## 사용자 변경 사항 (User Review Required)
> [!IMPORTANT]
> **팻룸 중심 트리거 (Pet Room Only Trigger)**
> 이제 게임 결과 화면이나 다른 페이지에서 경험치를 채우더라도 즉시 진화하지 않습니다. 사용자가 **팻룸으로 돌아오는 순간**에 진화 애니메이션이 시작됩니다. 이를 통해 페이지 이동 중 팝업이 뜨는 사이드 이펙트를 원천 차단합니다.

## 상세 설계 (Detailed Design)

### 1. 생애주기 단계 (Lifecycle Stages)

#### 1단계: 성장기 (Growth Phase) [Stage 1 ~ 3]
*   **상태**: 경험치(XP)가 가득 참.
    *   **Stage 1 -> 2**: 50 XP 달성 시
    *   **Stage 2 -> 3**: 550 XP 달성 시
    *   **Stage 3 -> 4**: 3550 XP 달성 시
*   **동작**:
    *   다른 페이지(게임 등): 진화하지 않음.
    *   **팻룸 진입 시**: 자동 진화 애니메이션 **없음**.
    *   **UI**: 화면 벽면(Wall) 영역에 **[진화] 아이콘**이 활성화됨.
    *   **사용자 액션**: 아이콘 클릭 시 진화 애니메이션 재생 -> 완료 후 Stage 상승.

### 🌟 예외 처리: 진화 건너뛰기 (Multiple Stage Scenarios)
만약 유저가 진화를 안 시키고 계속 게임을 해서 **다음 단계(예: Stage 3, 4)의 XP까지 도달한 경우**:
*   **원칙**: **"한 번에 한 단계씩"** 진화합니다. (Stage 스킵 불가)
*   **시나리오**:
    1.  유저가 Stage 1에서 Stage 4 분량의 XP를 모음.
    2.  팻룸 진입 -> [진화 가능] 아이콘 클릭.
    3.  Stage 1 -> 2 진화 애니메이션 재생.
    4.  애니메이션 종료 후에도 여전히 XP가 충분하므로 **[진화 가능] 아이콘이 다시 나타남**.
    5.  유저는 다시 클릭하여 2 -> 3 -> 4 순서로 차례대로 진화를 즐길 수 있음.
*   **이유**: 각 단계별 캐릭터의 모습과 성장을 놓치지 않고 경험하게 하기 위함입니다.

#### 2단계: 성숙기 (Maturity Phase) [Stage 4, Max XP]
*   **상태**: 4단계에서 **6500 XP**를 모두 채움 (만렙 달성). "성체(Mature)" 상태로 전환.
*   **동작**:
    *   자동 진화 없음/자동 팝업 없음.
    *   **팻룸 UI (직관적인 버튼 노출)**:
        *   벽면(Wall) 영역에 **[졸업] 아이콘**이 기본적으로 표시됨.
        *   **조건 충족 시 (별 1000개 이상)**: **[전설 진화] 아이콘**이 **[졸업] 아이콘** 옆에 추가로 표시됨. (두 버튼이 동시에 존재 가능)
    *   **사용자 액션 (모달 없음)**: 
        *   [졸업] 클릭 -> 즉시 **졸업 애니메이션** 시작.
        *   [전설 진화] 클릭 -> 즉시 **Stage 5 진화 애니메이션** 시작.
        *   *불필요한 선택 팝업(`EvolutionChoiceModal`)을 제거하여 더 빠른 경험 제공.*

#### 3단계: 졸업/엔딩 (Graduation/Ending)
*   **동작**: 졸업 선택 시 졸업 애니메이션 재생 -> 명예의 전당 등록 -> 알 생성(세대 교체).
*   **데이터 리셋**: `startNewGeneration` 함수가 호출되며, 다음 데이터가 초기화됩니다:
    *   **XP -> 0 (초기화 됨)**
    *   캐릭터 상태 -> 알(Egg)
    *   History -> 초기화
    *   *보존 데이터*: 보유 재화(Gro), 누적 별(Stars), 인벤토리, 도감, 명예의 전당.

## 구현 계획 (Implementation Details)

### 1. `useEvolutionLogic.ts` (로직 분리)
*   **기존**: `isEvolving`, `isGraduating` 상태가 로직 내부에서 자동 `true` 전환.
*   **변경**:
    *   `evolutionStatus` 상태 추가: `'IDLE' | 'READY_TO_EVOLVE' | 'MATURE'`
    *   `addXP` 함수는 XP만 증가시키고, 조건 충족 시 `evolutionStatus`를 변경.
    *   `triggerEvolution()`: 실제로 애니메이션을 시작(`isEvolving = true`)시키는 함수 분리.

### 2. `PetRoom.tsx` (트리거 통합)
*   **애니메이션 이관**: `App.tsx`에 있는 `<EvolutionAnimation>`, `<GraduationAnimation>`을 `PetRoom.tsx` 내부로 이동.
*   **벽 버튼 추가**:
    *   `useEvolutionLogic`에서 `evolutionPhase`를 받아옵니다.
    *   **Phase 1-3 (READY_TO_EVOLVE)**: [진화] 아이콘 표시. 클릭 시 `triggerEvolution()`.
    *   **Phase 4 (MATURE)**: [졸업] 아이콘 기본 표시.
    *   **Phase 4 (LEGENDARY_READY)**: [졸업], [전설 진화] 아이콘 동시 표시.
*   **모달 제거**: `EvolutionChoiceModal`을 사용하지 않고, 아이콘 클릭 시 즉시 실행.

### 3. `evolutionService.ts`
*   복잡한 `showChoicePopup` 플래그 제거. 순수하게 `getEvolutionStatus(xp, stage)` 함수로 상태만 반환하도록 정리.

## 검증 계획 (Verification Plan)
1.  **성장기 진화 (Stage 1-3)**:
    *   XP 채움 -> 팻룸 진입 -> **자동 진화 안 함** 확인.
    *   벽면 **[진화]** 아이콘 클릭 -> 진화 애니메이션 실행 확인.
2.  **성숙기 도달 (Stage 4)**: 
    *   6500 XP 달성 -> 팻룸 진입.
    *   벽면 **[졸업]** 아이콘 등장 확인.
    *   (별 1000개 미만) -> [전설 진화] 아이콘 **없음** 확인.
    *   (별 1000개 이상) -> [전설 진화] 아이콘 **등장** 확인.
3.  **졸업/진화 실행**: 
    *   각 버튼 클릭 시 즉시 해당 애니메이션 실행 및 데이터 처리 확인.
