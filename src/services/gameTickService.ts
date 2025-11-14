/**
 * Game Tick Service
 * 게임 로직 틱 시스템 - 1분마다 스탯 자동 갱신
 */

import type {
  NurturingStats,
  CharacterCondition,
  TickResult,
  Poop,
} from '../types/nurturing';
import {
  NATURAL_DECAY,
  HUNGER_PENALTY,
  DIRTY_PENALTY,
  SICK_PENALTY,
  POOP_PENALTY_PER_ITEM,
  THRESHOLDS,
  STAT_MIN,
  STAT_MAX,
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
  const isDirty = stats.cleanliness < THRESHOLDS.DIRTY;
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
    stats.cleanliness < THRESHOLDS.CRITICAL ||
    stats.happiness < THRESHOLDS.CRITICAL;

  return {
    isHungry,
    isDirty,
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
  newStats.cleanliness += NATURAL_DECAY.cleanliness;
  newStats.happiness += NATURAL_DECAY.happiness;
  // health는 자연 감소 없음

  // ==================== B. 상태 평가 ====================
  const condition = evaluateCondition(currentStats); // 변경 전 상태 기준으로 판정

  // ==================== C. 상호 악화 (Vicious Cycle) ====================

  // 1. 배고픔 상태 (fullness < 30)
  if (condition.isHungry) {
    newStats.happiness += HUNGER_PENALTY.happiness;
    newStats.health += HUNGER_PENALTY.health;
    penalties.hunger = HUNGER_PENALTY.happiness + HUNGER_PENALTY.health;
    alerts.push('배고픔 페널티: 행복도/건강 감소');
  }

  // 2. 더러움 상태 (cleanliness < 20)
  if (condition.isDirty) {
    newStats.happiness += DIRTY_PENALTY.happiness;
    newStats.health += DIRTY_PENALTY.health;
    penalties.dirty = DIRTY_PENALTY.happiness + DIRTY_PENALTY.health;
    alerts.push('더러움 페널티: 행복도/건강 감소 (심각)');
  }

  // 3. 아픔 상태 (health < 50)
  if (condition.isSick) {
    newStats.happiness += SICK_PENALTY.happiness;
    newStats.fullness += SICK_PENALTY.fullness;
    penalties.sick = SICK_PENALTY.happiness + SICK_PENALTY.fullness;
    alerts.push('아픔 페널티: 행복도/포만감 감소');
  }

  // 4. 똥 방치 페널티
  if (poops.length > 0) {
    const poopPenalty = {
      health: POOP_PENALTY_PER_ITEM.health * poops.length,
      happiness: POOP_PENALTY_PER_ITEM.happiness * poops.length,
      cleanliness: POOP_PENALTY_PER_ITEM.cleanliness * poops.length,
    };
    newStats.health += poopPenalty.health;
    newStats.happiness += poopPenalty.happiness;
    newStats.cleanliness += poopPenalty.cleanliness;
    penalties.poopDebuff = Math.abs(poopPenalty.health + poopPenalty.happiness + poopPenalty.cleanliness);
    alerts.push(`똥 방치 페널티 (${poops.length}개): 모든 스탯 감소`);
  }

  // ==================== D. 스탯 범위 제한 ====================
  newStats.fullness = clampStat(newStats.fullness);
  newStats.health = clampStat(newStats.health);
  newStats.cleanliness = clampStat(newStats.cleanliness);
  newStats.happiness = clampStat(newStats.happiness);

  // ==================== E. 결과 반환 ====================
  const statChanges: Partial<NurturingStats> = {
    fullness: newStats.fullness - currentStats.fullness,
    health: newStats.health - currentStats.health,
    cleanliness: newStats.cleanliness - currentStats.cleanliness,
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
    stats.cleanliness += tickResult.statChanges.cleanliness || 0;
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
  stats.cleanliness = clampStat(stats.cleanliness);
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