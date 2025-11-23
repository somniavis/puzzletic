/**
 * Game Tick Service
 * 게임 로직 틱 시스템 - 1분마다 스탯 자동 갱신
 */

import type {
  NurturingStats,
  CharacterCondition,
  TickResult,
  Poop,
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
export const evaluateCondition = (stats: NurturingStats): CharacterCondition => {
  const isHungry = stats.fullness < THRESHOLDS.HUNGER;
  const isSick = stats.health < THRESHOLDS.SICK;

  // 학습 가능 여부: 너무 불행하거나 아프거나 배고프면 불가
  const canStudy =
    stats.happiness >= 30 &&
    stats.health >= 30 &&
    stats.fullness >= 20;

  // 즉시 케어 필요: 위험 상태인 스탯이 하나라도 있으면
  const needsAttention =
    stats.fullness < THRESHOLDS.CRITICAL ||
    stats.health < THRESHOLDS.CRITICAL ||
    stats.happiness < THRESHOLDS.CRITICAL;

  return {
    isHungry,
    isSick,
    canStudy,
    needsAttention,
  };
};

/**
 * 1회 로직 틱 실행 (1분 경과)
 * @param currentStats 현재 스탯
 * @param poops 현재 바닥에 있는 똥 목록
 * @returns 틱 실행 결과 (스탯 변화, 상태, 페널티, 알림)
 */
export const executeGameTick = (
  currentStats: NurturingStats,
  poops: Poop[] = []
): TickResult => {
  // 새 스탯 객체 (변경사항 누적)
  const newStats = { ...currentStats };
  const alerts: string[] = [];
  const penalties: TickResult['penalties'] = {};

  // ==================== A. 기본 감소 (Natural Decay) ====================
  newStats.fullness += NATURAL_DECAY.fullness;
  newStats.happiness += NATURAL_DECAY.happiness;
  newStats.health += NATURAL_DECAY.health;

  // ==================== B. 상태 평가 ====================
  const condition = evaluateCondition(currentStats); // 변경 전 상태 기준으로 판정

  // ==================== C. 상호 악화 (Vicious Cycle) ====================

  // 1. 배고픔 상태 페널티
  if (currentStats.fullness < 20) {
    // 심각한 배고픔
    newStats.happiness += HUNGER_PENALTY.severe.happiness;
    newStats.health += HUNGER_PENALTY.severe.health;
    penalties.hunger = Math.abs(HUNGER_PENALTY.severe.happiness + HUNGER_PENALTY.severe.health);
    alerts.push('심각한 배고픔 페널티: 행복도/건강 감소');
  } else if (currentStats.fullness < 40) {
    // 경미한 배고픔
    newStats.happiness += HUNGER_PENALTY.mild.happiness;
    newStats.health += HUNGER_PENALTY.mild.health;
    penalties.hunger = Math.abs(HUNGER_PENALTY.mild.happiness + HUNGER_PENALTY.mild.health);
    alerts.push('배고픔 페널티: 행복도/건강 감소');
  }

  // 2. 아픔 상태 페널티 (health < 50)
  if (condition.isSick) {
    newStats.happiness += SICK_PENALTY.happiness;
    penalties.sick = Math.abs(SICK_PENALTY.happiness);
    alerts.push('아픔 페널티: 행복도 감소');
  }

  // 3. 불행 상태 페널티 (happiness < 20)
  if (currentStats.happiness < 20) {
    newStats.health += UNHAPPY_PENALTY.health;
    alerts.push('불행 페널티: 건강 감소');
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

  // ==================== D. 스탯 범위 제한 ====================
  newStats.fullness = clampStat(newStats.fullness);
  newStats.health = clampStat(newStats.health);
  newStats.happiness = clampStat(newStats.happiness);

  // ==================== E. 결과 반환 ====================
  const statChanges: Partial<NurturingStats> = {
    fullness: newStats.fullness - currentStats.fullness,
    health: newStats.health - currentStats.health,
    happiness: newStats.happiness - currentStats.happiness,
  };

  const finalCondition = evaluateCondition(newStats);

  return {
    statChanges,
    condition: finalCondition,
    penalties,
    alerts,
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
  poops: Poop[] = []
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

  for (let i = 0; i < ticksElapsed; i++) {
    const tickResult = executeGameTick(stats, poops);

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

  // 최종 범위 제한
  stats.fullness = clampStat(stats.fullness);
  stats.health = clampStat(stats.health);
  stats.happiness = clampStat(stats.happiness);

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