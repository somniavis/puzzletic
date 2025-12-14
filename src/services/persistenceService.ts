/**
 * Persistence Service
 * 로컬 저장 및 오프라인 진행 계산
 */

import type {
  NurturingStats,
  NurturingPersistentState,
  Poop,
} from '../types/nurturing';
import {
  DEFAULT_NURTURING_STATS,
  TICK_INTERVAL_MS,
  DEFAULT_ABANDONMENT_STATE,
} from '../constants/nurturing';
import { calculateOfflineProgress, checkAbandonmentState } from './gameTickService';
import { protectData, restoreData } from './simpleEncryption';

const STORAGE_KEY = 'puzzleletic_nurturing_state_v4';
const CHECKSUM_KEY = 'puzzleletic_checksum';

/**
 * 기본 상태 생성
 */
const createDefaultState = (): NurturingPersistentState => {
  return {
    stats: { ...DEFAULT_NURTURING_STATS },
    poops: [],
    pendingPoops: [], // 지연 생성 대기 중인 똥
    bugs: [],         // 벌레 목록
    lastActiveTime: Date.now(),
    tickConfig: {
      intervalMs: TICK_INTERVAL_MS,
      lastTickTime: Date.now(),
      isActive: true,
    },
    gro: 20,
    currentLand: 'default_ground',
    totalCurrencyEarned: 0,
    studyCount: 0,
    abandonmentState: { ...DEFAULT_ABANDONMENT_STATE },
    inventory: ['default_ground'],
    hasCharacter: false,
    xp: 0,
    evolutionStage: 1, // Start at Egg
    speciesId: 'yellowJello',
    history: {
      foodsEaten: {},
      gamesPlayed: {},
      actionsPerformed: {},
      totalLifetimeGroEarned: 0,
    },
    unlockedJellos: {},
  };
};

/**
 * 상태 저장 (localStorage)
 * 민감한 데이터(glo, totalCurrencyEarned 등)를 암호화하여 저장
 */
export const saveNurturingState = (state: NurturingPersistentState): void => {
  try {
    // 민감한 데이터 암호화 및 체크섬 생성
    const { protectedData, checksum } = protectData(state);

    const serialized = JSON.stringify(protectedData);
    localStorage.setItem(STORAGE_KEY, serialized);
    localStorage.setItem(CHECKSUM_KEY, checksum);
  } catch (error) {
    console.error('Failed to save nurturing state:', error);
  }
};

/**
 * 상태 불러오기 (localStorage)
 * 암호화된 민감한 데이터 복원 및 무결성 검증
 */
export const loadNurturingState = (): NurturingPersistentState => {
  try {
    const serialized = localStorage.getItem(STORAGE_KEY);
    const storedChecksum = localStorage.getItem(CHECKSUM_KEY);

    if (!serialized) {
      // 저장된 데이터 없음 - 새로 시작
      return createDefaultState();
    }

    const protectedState = JSON.parse(serialized) as any;

    // 암호화된 데이터가 있으면 복원 시도
    let loaded: any;
    if (protectedState._enc && storedChecksum) {
      loaded = restoreData(protectedState, storedChecksum);

      if (!loaded) {
        console.warn('⚠️ Data tampering detected! Resetting sensitive data.');
        // 조작이 감지되면 민감한 데이터만 초기화
        loaded = protectedState;
        delete loaded._enc;
        loaded.gro = 20;
        loaded.totalCurrencyEarned = 0;
        loaded.studyCount = 0;
      }
    } else {
      // 암호화되지 않은 구버전 데이터
      loaded = protectedState;
    }

    // 데이터 무결성 검증
    if (!loaded.stats || !loaded.lastActiveTime) {
      console.warn('Invalid saved state, resetting to default');
      return createDefaultState();
    }

    // 마이그레이션: cleanliness 제거 및 건강에 통합
    if (loaded.stats.cleanliness !== undefined) {
      console.log('🔄 Migrating old data: removing cleanliness, integrating into health');

      // 청결도를 건강에 반영 (평균값 사용)
      const oldHealth = loaded.stats.health || 50;
      const oldCleanliness = loaded.stats.cleanliness || 50;
      loaded.stats.health = Math.round((oldHealth + oldCleanliness) / 2);

      // cleanliness 제거
      delete loaded.stats.cleanliness;
    }

    // 기존 데이터에 abandonmentState가 없으면 기본값 추가
    if (!loaded.abandonmentState) {
      loaded.abandonmentState = { ...DEFAULT_ABANDONMENT_STATE };
    }

    // pendingPoops가 없으면 빈 배열 추가
    if (!loaded.pendingPoops) {
      loaded.pendingPoops = [];
    }

    // bugs가 없으면 빈 배열 추가
    if (!loaded.bugs) {
      loaded.bugs = [];
    }

    // glo -> gro migration
    if (loaded.glo !== undefined && loaded.gro === undefined) {
      console.log('🔄 Migrating old data: Glo -> Gro');
      loaded.gro = loaded.glo;
      delete loaded.glo;
    }

    // glo가 없거나 0이면 20으로 초기화 (테스트용/기본값)
    if (loaded.gro === undefined) {
      loaded.gro = 20;
    }

    // 똥 데이터 마이그레이션: cleanlinessDebuff → healthDebuff
    if (loaded.poops) {
      loaded.poops = loaded.poops.map((poop: any) => {
        if (poop.cleanlinessDebuff !== undefined && poop.healthDebuff === undefined) {
          return {
            ...poop,
            healthDebuff: poop.cleanlinessDebuff,
          };
        }
        return poop;
      });
    }

    if (loaded.pendingPoops) {
      loaded.pendingPoops = loaded.pendingPoops.map((poop: any) => {
        if (poop.cleanlinessDebuff !== undefined && poop.healthDebuff === undefined) {
          return {
            ...poop,
            healthDebuff: poop.cleanlinessDebuff,
          };
        }
        return poop;
      });
    }

    // inventory가 없으면 기본값 추가
    if (!loaded.inventory) {
      loaded.inventory = ['default_ground'];
    }

    // currentLand가 없으면 기본값 설정
    if (!loaded.currentLand) {
      loaded.currentLand = 'default_ground';
    }

    // GP -> XP 마이그레이션
    if (loaded.gp !== undefined && loaded.xp === undefined) {
      console.log('🔄 Migrating old data: GP -> XP');
      loaded.xp = loaded.gp;
      delete loaded.gp;
    }
    // XP가 없으면 0으로 초기화
    if (loaded.xp === undefined) {
      loaded.xp = 0;
    }

    // History 초기화
    if (!loaded.history) {
      console.log('🔄 Init history for existing user');
      loaded.history = {
        foodsEaten: {},
        gamesPlayed: {},
        actionsPerformed: {},
        totalLifetimeGroEarned: 0,
      };
    }

    if (!loaded.speciesId) {
      loaded.speciesId = 'yellowJello';
    }

    // 도감 초기화 (기존 유저 마이그레이션)
    if (!loaded.unlockedJellos) {
      console.log('🔄 Init encyclopedia for existing user');
      loaded.unlockedJellos = {};

      // 현재 키우고 있는 젤로의 모든 이전 단계 해금 처리
      // (예: 현재 3단계라면 1, 2, 3단계 모두 해금된 것으로 간주)
      if (loaded.speciesId && loaded.evolutionStage) {
        const currentSpecies = loaded.speciesId;
        const currentStage = loaded.evolutionStage;
        const unlockedStages = [];
        for (let i = 1; i <= currentStage; i++) {
          unlockedStages.push(i);
        }
        loaded.unlockedJellos[currentSpecies] = unlockedStages;
      }
    }

    return loaded as NurturingPersistentState;
  } catch (error) {
    console.error('Failed to load nurturing state:', error);
    return createDefaultState();
  }
};

/**
 * 오프라인 진행 계산 및 상태 업데이트
 */
export const applyOfflineProgress = (
  state: NurturingPersistentState
): {
  updatedState: NurturingPersistentState;
  ticksElapsed: number;
  events: string[];
} => {
  const currentTime = Date.now();
  const timeElapsed = currentTime - state.lastActiveTime;

  // 1분 미만이면 오프라인 진행 없음
  if (timeElapsed < state.tickConfig.intervalMs) {
    return {
      updatedState: state,
      ticksElapsed: 0,
      events: [],
    };
  }

  // 틱이 비활성화된 경우 (예: 미니게임 중) 오프라인 진행 없음
  if (!state.tickConfig.isActive) {
    return {
      updatedState: {
        ...state,
        lastActiveTime: currentTime,
        tickConfig: {
          ...state.tickConfig,
          lastTickTime: currentTime,
        },
      },
      ticksElapsed: 0,
      events: [],
    };
  }

  // 오프라인 진행 계산
  const { finalStats, ticksElapsed, events } = calculateOfflineProgress(
    state.stats,
    state.lastActiveTime,
    currentTime,
    state.tickConfig.intervalMs,
    state.poops,
    state.bugs || []
  );

  // 가출 상태 체크
  const updatedAbandonmentState = checkAbandonmentState(
    finalStats,
    state.abandonmentState,
    currentTime
  );

  // 상태 업데이트
  const updatedState: NurturingPersistentState = {
    ...state,
    stats: finalStats,
    lastActiveTime: currentTime,
    abandonmentState: updatedAbandonmentState,
    tickConfig: {
      ...state.tickConfig,
      lastTickTime: currentTime,
    },
  };

  return {
    updatedState,
    ticksElapsed,
    events,
  };
};

/**
 * 상태 초기화
 */
export const resetNurturingState = (): NurturingPersistentState => {
  const newState = createDefaultState();
  saveNurturingState(newState);
  return newState;
};

/**
 * 특정 스탯 업데이트
 */
export const updateStats = (
  currentState: NurturingPersistentState,
  statChanges: Partial<NurturingStats>
): NurturingPersistentState => {
  const updatedStats = { ...currentState.stats };

  if (statChanges.fullness !== undefined) {
    updatedStats.fullness = statChanges.fullness;
  }
  if (statChanges.health !== undefined) {
    updatedStats.health = statChanges.health;
  }
  if (statChanges.happiness !== undefined) {
    updatedStats.happiness = statChanges.happiness;
  }

  const newState = {
    ...currentState,
    stats: updatedStats,
    lastActiveTime: Date.now(),
  };

  saveNurturingState(newState);
  return newState;
};

/**
 * 똥 추가
 */
export const addPoop = (
  currentState: NurturingPersistentState,
  poop: Poop
): NurturingPersistentState => {
  const newState = {
    ...currentState,
    poops: [...currentState.poops, poop],
  };

  saveNurturingState(newState);
  return newState;
};

/**
 * 똥 제거
 */
export const removePoops = (
  currentState: NurturingPersistentState,
  poopIds: string[]
): NurturingPersistentState => {
  const newState = {
    ...currentState,
    poops: currentState.poops.filter((p) => !poopIds.includes(p.id)),
  };

  saveNurturingState(newState);
  return newState;
};

/**
 * 재화 추가
 */
export const addCurrency = (
  currentState: NurturingPersistentState,
  amount: number
): NurturingPersistentState => {
  const newState = {
    ...currentState,
    totalCurrencyEarned: currentState.totalCurrencyEarned + amount,
    studyCount: currentState.studyCount + 1,
  };

  saveNurturingState(newState);
  return newState;
};