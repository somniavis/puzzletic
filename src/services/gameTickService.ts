/**
 * Game Tick Service
 * 게임 로직 틱 시스템 - 1분마다 스탯 자동 갱신
 */

import type {
  NurturingStats,
  CharacterCondition,
  TickResult,
  Poop,
  Bug,
  BugType,
  AbandonmentState,
  AbandonmentStatusUI,
} from '../types/nurturing';
import {
  NATURAL_DECAY,
  HUNGER_PENALTY,
  SICK_PENALTY,
  POOP_PENALTY,
  UNHAPPY_PENALTY,
  THRESHOLDS,
  STAT_MIN,
  STAT_MAX,
  ABANDONMENT_PERIODS,
  ABANDONMENT_MESSAGE_KEYS,
  BUG_CONFIG,
  SICK_CONFIG,
} from '../constants/nurturing';

/**
 * 스탯을 범위 내로 제한
 */
export const clampStat = (value: number): number => {
  return Math.max(STAT_MIN, Math.min(STAT_MAX, value));
};

/**
 * 캐릭터의 현재 상태 판정
 */
export const evaluateCondition = (stats: NurturingStats, isSick: boolean = false): CharacterCondition => {
  const isHungry = stats.fullness < THRESHOLDS.HUNGER;
  // 기존: health < 50이면 아픔
  // 변경: health < 50 이거나 isSick 상태이면 아픔
  const isSickCondition = isSick || stats.health < THRESHOLDS.SICK;

  // 학습 가능 여부: 너무 불행하거나 아프거나 배고프면 불가
  const canStudy =
    stats.happiness >= 30 &&
    !isSickCondition && // 아프면 공부 불가
    stats.health >= 30 &&
    stats.fullness >= 20;

  // 즉시 케어 필요: 위험 상태인 스탯이 하나라도 있으면
  const needsAttention =
    isSick || // 질병 상태면 즉시 케어 필요
    stats.fullness < THRESHOLDS.CRITICAL ||
    stats.health < THRESHOLDS.CRITICAL ||
    stats.happiness < THRESHOLDS.CRITICAL;

  return {
    isHungry,
    isSick: isSickCondition,
    canStudy,
    needsAttention,
  };
};

// ... (createBug omitted)

// ... (executeGameTick implementation)





/**
 * 벌레 생성
 * @returns 새로 생성된 벌레
 */
export const createBug = (type: BugType): Bug => {
  return {
    id: `bug-${Date.now()}-${Math.random()}`,
    type,
    x: Math.random() * 80 + 10, // 10-90%
    y: Math.random() * 60 + 20, // 20-80%
    createdAt: Date.now(),
    healthDebuff: BUG_CONFIG.HEALTH_DEBUFF_PER_BUG,
    happinessDebuff: BUG_CONFIG.HAPPINESS_DEBUFF_PER_BUG,
  };
};

/**
 * 1회 로직 틱 실행 (1분 경과)
 * @param currentStats 현재 스탯
 * @param poops 현재 바닥에 있는 똥 목록
 * @param bugs 현재 벌레 목록
 * @param gameDifficulty 게임 난이도
 * @param isSick 현재 질병 상태
 * @returns 틱 실행 결과 (스탯 변화, 상태, 페널티, 알림, 질병 상태 변화)
 */
export const executeGameTick = (
  currentStats: NurturingStats,
  poops: Poop[] = [],
  bugs: Bug[] = [],
  gameDifficulty: number | null = null,
  isSick: boolean = false,
  isSleeping: boolean = false
): TickResult & { newIsSick: boolean } => {
  // 새 스탯 객체 (변경사항 누적)
  const newStats = { ...currentStats };
  const alerts: string[] = [];
  const penalties: TickResult['penalties'] = {};
  let newBugs = [...bugs];
  let newIsSick = isSick;

  // ==================== A. 기본 감소 (Natural Decay) ====================
  // 수면 상태일 경우 감소율 50% 적용 (tick 2배 느림)
  const decayMultiplier = isSleeping ? 0.5 : 1.0;

  if (gameDifficulty !== null) {
    // 게임 플레이 중: 난이도에 따른 차등 적용
    // 행복도: 1.5 * 난이도 - 0.5 (1단계: 1.0 ~ 5단계: 7.0)
    // 포만감: -1.0 * 난이도 - 0.5 (1단계: -1.5 ~ 5단계: -5.5)
    // 게임 중엔 수면 불가하므로 multiplier 미적용 (어차피 isSleeping=false여야 함)
    const happinessBonus = (1.5 * gameDifficulty) - 0.5;
    const fullnessDecay = (-1.0 * gameDifficulty) - 0.5;

    newStats.fullness += fullnessDecay;
    newStats.happiness += happinessBonus;
    newStats.health += NATURAL_DECAY.health;
  } else {
    // 평상시
    const fullnessChange = NATURAL_DECAY.fullness * decayMultiplier;
    const healthChange = NATURAL_DECAY.health * decayMultiplier;

    // 수면 중 행복도 로직: 역으로 상승 (tick 속도에 맞춰 0.5배 적용)
    let happinessChange;
    if (isSleeping) {
      // 감소량(-0.3)의 절댓값을 더함 -> +0.15
      happinessChange = Math.abs(NATURAL_DECAY.happiness) * decayMultiplier;
    } else {
      happinessChange = NATURAL_DECAY.happiness * decayMultiplier;
    }

    newStats.fullness += fullnessChange;
    newStats.happiness += happinessChange;
    newStats.health += healthChange;
  }

  // ==================== B. 질병 페널티 (Sick Penalty) ====================
  if (newIsSick) {
    newStats.health += SICK_CONFIG.PENALTY.health;
    newStats.happiness += SICK_CONFIG.PENALTY.happiness;
    penalties.sick = Math.abs(SICK_CONFIG.PENALTY.health);
    alerts.push('질병으로 인해 건강이 빠르게 악화되고 있습니다!');
  }

  // ==================== C. 상태별 페널티 (Condition Penalties) ====================
  // 1. 배고픔 페널티
  if (currentStats.fullness < THRESHOLDS.CRITICAL) {
    // 심각한 배고픔 (20 미만)
    newStats.happiness += HUNGER_PENALTY.severe.happiness;
    newStats.health += HUNGER_PENALTY.severe.health;
    penalties.hunger = Math.abs(HUNGER_PENALTY.severe.health);
    alerts.push('배가 너무 고파서 건강이 크게 나빠집니다.');
  } else if (currentStats.fullness < THRESHOLDS.HUNGER) {
    // 일반 배고픔 (30 미만)
    newStats.happiness += HUNGER_PENALTY.mild.happiness;
    newStats.health += HUNGER_PENALTY.mild.health;
    penalties.hunger = Math.abs(HUNGER_PENALTY.mild.health);
    alerts.push('배가 고파서 건강과 행복도가 감소합니다.');
  }

  // 2. 아픔 페널티 (기존 낮은 건강 페널티)
  if (currentStats.health < THRESHOLDS.SICK) {
    newStats.happiness += SICK_PENALTY.happiness;
    penalties.sick = (penalties.sick || 0) + Math.abs(SICK_PENALTY.happiness);
    // alerts.push('몸이 아파서 행복도가 감소합니다.');
  }

  // 3. 불행 페널티
  if (currentStats.happiness < THRESHOLDS.CRITICAL) {
    newStats.health += UNHAPPY_PENALTY.health;
    alerts.push('우울해서 건강이 나빠집니다.');
  }

  // 4. 똥 방치 페널티
  if (poops.length > 0) {
    let healthPenalty = 0;

    if (poops.length === 1) {
      healthPenalty = POOP_PENALTY.perPoop;
    } else if (poops.length === 2) {
      healthPenalty = POOP_PENALTY.twoPoops;
    } else {
      healthPenalty = POOP_PENALTY.threeOrMore;
    }

    const happinessPenalty = POOP_PENALTY.happiness * poops.length;

    newStats.health += healthPenalty;
    newStats.happiness += happinessPenalty;
    penalties.poopDebuff = Math.abs(healthPenalty + happinessPenalty);
    alerts.push(`똥 방치 페널티 (${poops.length}개): 건강/행복도 감소`);
  }

  // 5. 벌레 페널티
  if (newBugs.length > 0) {
    const bugHealthPenalty = BUG_CONFIG.HEALTH_DEBUFF_PER_BUG * newBugs.length;
    const bugHappinessPenalty = BUG_CONFIG.HAPPINESS_DEBUFF_PER_BUG * newBugs.length;

    newStats.health += bugHealthPenalty;
    newStats.happiness += bugHappinessPenalty;
    alerts.push(`벌레 페널티 (${newBugs.length}마리): 건강/행복도 감소`);
  }

  // ==================== D. 벌레 생성 및 질병 감염 ====================
  if (newBugs.length < BUG_CONFIG.MAX_BUGS) {
    let bugSpawned = false;

    // 파리 생성 (똥이 있을 때만)
    if (poops.length > 0) {
      const flySpawnChance = poops.length * BUG_CONFIG.FLY_SPAWN_CHANCE_PER_POOP;
      if (Math.random() < flySpawnChance) {
        newBugs.push(createBug('fly'));
        alerts.push('파리가 나타났어요!');
        bugSpawned = true;
      }
    }

    // 모기 생성 (시간에 따라)
    if (!bugSpawned && Math.random() < BUG_CONFIG.MOSQUITO_SPAWN_CHANCE) {
      newBugs.push(createBug('mosquito'));
      alerts.push('모기가 나타났어요!');
      bugSpawned = true;
    }

    // 벌레 생성 시 질병 감염 체크
    // 수정: 건강이 나쁠 때(50 미만)만 감염됨
    if (bugSpawned && !newIsSick && newStats.health < THRESHOLDS.SICK) {
      // 확률: 기본(10%) + (현재 벌레 수 * 5%)
      // newBugs에는 방금 생성된 벌레가 포함되어 있음
      const currentBugCount = newBugs.length; // 방금 생성된 것 포함
      const sickChance = SICK_CONFIG.CHANCE.BASE + (currentBugCount * SICK_CONFIG.CHANCE.PER_BUG);

      if (Math.random() < sickChance) {
        newIsSick = true;
        alerts.push('벌레 때문에 젤로가 병에 걸렸어요! 💊 약이 필요합니다.');
      }
    }
  }

  // ==================== E. 스탯 범위 제한 및 소수점 보정 ====================
  // 부동소수점 오차 방지를 위해 소수점 2자리까지만 유지
  const roundStat = (val: number) => Math.round(val * 100) / 100;

  newStats.fullness = clampStat(roundStat(newStats.fullness));
  newStats.health = clampStat(roundStat(newStats.health));
  newStats.happiness = clampStat(roundStat(newStats.happiness));

  // ==================== F. 결과 반환 ====================
  const statChanges: Partial<NurturingStats> = {
    fullness: newStats.fullness - currentStats.fullness,
    health: newStats.health - currentStats.health,
    happiness: newStats.happiness - currentStats.happiness,
  };

  const finalCondition = evaluateCondition(newStats, newIsSick);

  return {
    statChanges,
    condition: finalCondition,
    penalties,
    alerts,
    newBugs,
    newIsSick,
  };
};

/**
 * 오프라인 진행 계산 (따라잡기)
 * @param currentStats 마지막 저장된 스탯
 * @param lastActiveTime 마지막 활동 시간 (timestamp)
 * @param currentTime 현재 시간 (timestamp)
 * @param tickIntervalMs 틱 간격 (밀리초)
 * @param poops 마지막 똥 목록
 * @returns 최종 스탯과 발생한 이벤트
 */
export const calculateOfflineProgress = (
  currentStats: NurturingStats,
  lastActiveTime: number,
  currentTime: number,
  tickIntervalMs: number,
  poops: Poop[] = [],
  bugs: Bug[] = [],
  isSleeping: boolean = false,
  sleepRemainingMs: number = 0
): {
  finalStats: NurturingStats;
  ticksElapsed: number;
  events: string[];
} => {
  const timeElapsedMs = currentTime - lastActiveTime;
  const ticksElapsed = Math.floor(timeElapsedMs / tickIntervalMs);

  if (ticksElapsed === 0) {
    return {
      finalStats: currentStats,
      ticksElapsed: 0,
      events: [],
    };
  }

  // 각 틱마다 순차적으로 계산
  let stats = { ...currentStats };
  const events: string[] = [];
  let currentSleepRemaining = sleepRemainingMs;

  for (let i = 0; i < ticksElapsed; i++) {
    // 수면 상태 판정: 남은 수면 시간이 틱 간격보다 많으면 수면 중
    const isCurrentlySleeping = isSleeping && currentSleepRemaining > 0;

    // 수면 시간 차감
    if (isCurrentlySleeping) {
      currentSleepRemaining -= tickIntervalMs;
    }

    const tickResult = executeGameTick(stats, poops, bugs, null, false, isCurrentlySleeping);

    // 스탯 업데이트
    stats.fullness += tickResult.statChanges.fullness || 0;
    stats.health += tickResult.statChanges.health || 0;
    stats.happiness += tickResult.statChanges.happiness || 0;

    // 이벤트 기록 (중요한 것만)
    if (tickResult.condition.needsAttention) {
      events.push(`틱 ${i + 1}: 위험 상태 발생`);
    }
    if (tickResult.alerts.length > 0 && i % 10 === 0) {
      // 10틱마다 한 번씩만 기록 (너무 많은 이벤트 방지)
      events.push(`틱 ${i + 1}: ${tickResult.alerts.join(', ')}`);
    }
  }

  // 최종 범위 제한 및 소수점 보정
  const roundStat = (val: number) => Math.round(val * 100) / 100;

  stats.fullness = clampStat(roundStat(stats.fullness));
  stats.health = clampStat(roundStat(stats.health));
  stats.happiness = clampStat(roundStat(stats.happiness));

  return {
    finalStats: stats,
    ticksElapsed,
    events,
  };
};

/**
 * 스탯 상태 레벨 판정
 */
export const getStatState = (value: number): 'critical' | 'warning' | 'normal' | 'excellent' => {
  if (value < THRESHOLDS.CRITICAL) return 'critical';
  if (value < THRESHOLDS.WARNING) return 'warning';
  if (value < THRESHOLDS.GOOD) return 'normal';
  return 'excellent';
};

/**
 * 가출 상태 체크 및 업데이트
 * @param stats 현재 스탯
 * @param abandonmentState 현재 가출 상태
 * @param currentTime 현재 시간 (timestamp)
 * @returns 업데이트된 가출 상태
 */
export const checkAbandonmentState = (
  stats: NurturingStats,
  abandonmentState: AbandonmentState,
  currentTime: number
): AbandonmentState => {
  // 모든 스탯이 0인지 확인
  const allStatsZero =
    stats.fullness === 0 &&
    stats.health === 0 &&
    stats.happiness === 0;

  // 케이스 1: 모든 스탯이 0 (카운트다운 시작/진행)
  if (allStatsZero) {
    // 처음 0이 된 시점 기록
    if (!abandonmentState.allZeroStartTime) {
      abandonmentState.allZeroStartTime = currentTime;
    }

    const timeSinceAllZero = currentTime - abandonmentState.allZeroStartTime;

    // 7일 경과 → 가출 처리
    if (timeSinceAllZero >= ABANDONMENT_PERIODS.ABANDONED && !abandonmentState.hasAbandoned) {
      abandonmentState.hasAbandoned = true;
      abandonmentState.abandonedAt = currentTime;
    }
  }
  // 케이스 2: 스탯이 하나라도 회복됨 (카운트다운 리셋)
  else {
    // 가출하지 않은 경우에만 리셋
    if (!abandonmentState.hasAbandoned) {
      abandonmentState.allZeroStartTime = null;
    }
  }

  return abandonmentState;
};

/**
 * 가출 상태의 UI 정보 가져오기
 * @param abandonmentState 가출 상태
 * @param currentTime 현재 시간 (timestamp)
 * @returns UI 표시용 정보
 */
export const getAbandonmentStatusUI = (
  abandonmentState: AbandonmentState,
  currentTime: number
): AbandonmentStatusUI => {
  // 가출 완료
  if (abandonmentState.hasAbandoned) {
    return {
      level: 'abandoned',
      message: ABANDONMENT_MESSAGE_KEYS.ABANDONED,
    };
  }

  // 카운트다운 진행 중
  if (abandonmentState.allZeroStartTime) {
    const elapsed = currentTime - abandonmentState.allZeroStartTime;
    const timeLeft = ABANDONMENT_PERIODS.ABANDONED - elapsed;

    // 이탈 예고 단계 (3.5일 ~ 7일)
    if (elapsed >= ABANDONMENT_PERIODS.LEAVING) {
      // 시간 표시 없이 "Leaving soon!"만 표시
      return {
        level: 'leaving',
        message: ABANDONMENT_MESSAGE_KEYS.LEAVING,
        timeLeft,
      };
    }

    // 위기 단계 (1.75일 ~ 3.5일)
    if (elapsed >= ABANDONMENT_PERIODS.CRITICAL) {
      return {
        level: 'critical',
        message: ABANDONMENT_MESSAGE_KEYS.CRITICAL,
        timeLeft,
      };
    }

    // 위험 단계 (0 ~ 1.75일)
    return {
      level: 'danger',
      message: ABANDONMENT_MESSAGE_KEYS.DANGER,
      timeLeft,
    };
  }

  // 정상 상태
  return {
    level: 'normal',
    message: null,
  };
};