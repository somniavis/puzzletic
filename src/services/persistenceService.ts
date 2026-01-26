/**
 * Persistence Service
 * 로컬 저장 및 오프라인 진행 계산
 */

import type {
  NurturingPersistentState,
} from '../types/nurturing';
import {
  DEFAULT_NURTURING_STATS,
  TICK_INTERVAL_MS,
  DEFAULT_ABANDONMENT_STATE,
} from '../constants/nurturing';
import { calculateOfflineProgress, checkAbandonmentState } from './gameTickService';
import { protectData, restoreData } from './simpleEncryption';
import { createGameScore, getUnlockThreshold, getProgressionCategory } from '../utils/progression';
import type { GameScoreValue } from '../types/nurturing';

const STORAGE_KEY_PREFIX = 'puzzleletic_nurturing_state_v4';
const CHECKSUM_KEY_PREFIX = 'puzzleletic_checksum';

// Module-level user ID tracking for user-specific storage
let currentUserId: string | null = null;

/**
 * Set the current user ID for user-specific localStorage
 * Call this when user logs in/out
 */
export const setCurrentUserId = (userId: string | null) => {
  currentUserId = userId;
  console.log('📦 PersistenceService: User ID set to', userId);
};

// Generate user-specific storage keys
const getStorageKey = (userId?: string) => {
  const id = userId || currentUserId;
  return id ? `${STORAGE_KEY_PREFIX}_${id}` : STORAGE_KEY_PREFIX;
};
const getChecksumKey = (userId?: string) => {
  const id = userId || currentUserId;
  return id ? `${CHECKSUM_KEY_PREFIX}_${id}` : CHECKSUM_KEY_PREFIX;
};

const FAILSAFE_LAST_SEEN_KEY = 'puzzleletic_last_seen_stage';

/** 
 * Fail-safe persistence for lastSeenStage 
 * Bypasses main state blob to prevent loops on data merging/corruption 
 */
export const saveFailSafeLastSeenStage = (stage: number) => {
  try {
    localStorage.setItem(FAILSAFE_LAST_SEEN_KEY, String(stage));
  } catch (e) {
    console.warn('Failed to save fail-safe lastSeenStage:', e);
  }
};

export const getFailSafeLastSeenStage = (): number | null => {
  try {
    const stored = localStorage.getItem(FAILSAFE_LAST_SEEN_KEY);
    return stored ? parseInt(stored, 10) : null;
  } catch (e) {
    return null;
  }
};

/**
 * 기본 상태 생성
 */
export const createDefaultState = (): NurturingPersistentState => {
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
    lastSeenStage: 1, // Start at Egg (seen)
    // speciesId: undefined, 
    history: {
      foodsEaten: {},
      gamesPlayed: {},
      actionsPerformed: {},
      totalLifetimeGroEarned: 0,
    },
    unlockedJellos: {},
    hallOfFame: [],
    categoryProgress: {}, // Initialize empty progression map
    totalGameStars: 0,
    gameScores: {}, // Initialize empty scores map (Hybrid Storage v2)
    currentHouseId: 'tent',
  };
};

/**
 * 상태 저장 (localStorage)
 * 민감한 데이터(glo, totalCurrencyEarned 등)를 암호화하여 저장
 */
export const saveNurturingState = (state: NurturingPersistentState, userId?: string): void => {
  try {
    // 민감한 데이터 암호화 및 체크섬 생성
    const { protectedData, checksum } = protectData(state);

    const serialized = JSON.stringify(protectedData);
    localStorage.setItem(getStorageKey(userId), serialized);
    localStorage.setItem(getChecksumKey(userId), checksum);
  } catch (error) {
    console.error('Failed to save nurturing state:', error);
  }
};

/**
 * HELPHER: Legacy Data Migration
 * Handles all backward compatibility transformations
 */
const migrateLegacyData = (loaded: any): any => {
  // 1. Cleanliness Integration (-> Health)
  if (loaded.stats?.cleanliness !== undefined) {
    console.log('🔄 Migrating old data: removing cleanliness, integrating into health');
    const oldHealth = loaded.stats.health || 50;
    const oldCleanliness = loaded.stats.cleanliness || 50;
    loaded.stats.health = Math.round((oldHealth + oldCleanliness) / 2);
    delete loaded.stats.cleanliness;
  }

  // 2. Glo -> Gro
  if (loaded.glo !== undefined && loaded.gro === undefined) {
    console.log('🔄 Migrating old data: Glo -> Gro');
    loaded.gro = loaded.glo;
    delete loaded.glo;
  }
  if (loaded.gro === undefined) loaded.gro = 20;

  // 3. Poop/Bug Debuff Standardization
  if (loaded.poops) {
    loaded.poops = loaded.poops.map((poop: any) => {
      if (poop.cleanlinessDebuff !== undefined && poop.healthDebuff === undefined) {
        return { ...poop, healthDebuff: poop.cleanlinessDebuff };
      }
      return poop;
    });
  }

  // 4. GP -> XP
  if (loaded.gp !== undefined && loaded.xp === undefined) {
    console.log('🔄 Migrating old data: GP -> XP');
    loaded.xp = loaded.gp;
    delete loaded.gp;
  }
  if (loaded.xp === undefined) loaded.xp = 0;

  // 5. MinigameStats -> GameScores (Hybrid Storage v2)
  if (loaded.minigameStats && !loaded.gameScores) {
    console.log('🔄 [MIGRATION] Converting minigameStats to gameScores...');
    const migratedScores: Record<string, GameScoreValue> = {};

    for (const [gameId, stats] of Object.entries(loaded.minigameStats as Record<string, any>)) {
      const category = getProgressionCategory(gameId);
      const threshold = category ? getUnlockThreshold(category) : 4;
      const isUnlocked = stats.playCount >= threshold;

      migratedScores[gameId] = createGameScore(
        stats.highScore || 0,
        stats.playCount || 0,
        isUnlocked
      );
    }
    loaded.gameScores = migratedScores;
    delete loaded.minigameStats;
    delete loaded.totalMinigameScore;
    delete loaded.totalMinigamePlayCount;
  }

  // 6. Game ID Migration
  if (loaded.history && loaded.history.gamesPlayed) {
    const GAME_ID_MIGRATIONS: Record<string, string> = {
      'math-01-fishing-count': 'math-fishing-count',
      'math-01-round-counting': 'math-round-counting',
      'math-01-fruit-slice': 'math-fruit-slice',
      'math-01-number-balance': 'math-number-balance',
    };
    Object.entries(GAME_ID_MIGRATIONS).forEach(([oldId, newId]) => {
      if (loaded.history.gamesPlayed[oldId]) {
        loaded.history.gamesPlayed[newId] = loaded.history.gamesPlayed[oldId];
        delete loaded.history.gamesPlayed[oldId];
      }
    });
  }

  return loaded;
};


/**
 * 상태 불러오기 (localStorage)
 * 암호화된 민감한 데이터 복원 및 무결성 검증
 */
export const loadNurturingState = (userId?: string): NurturingPersistentState => {
  try {
    const serialized = localStorage.getItem(getStorageKey(userId));
    const storedChecksum = localStorage.getItem(getChecksumKey(userId));

    if (!serialized) {
      return createDefaultState();
    }

    const protectedState = JSON.parse(serialized) as any;
    let loaded: any;

    if (protectedState._enc && storedChecksum) {
      loaded = restoreData(protectedState, storedChecksum);
      if (!loaded) {
        console.warn('⚠️ Data tampering detected! Resetting sensitive data.');
        loaded = protectedState;
        delete loaded._enc;
        loaded.gro = 20;
        loaded.totalCurrencyEarned = 0;
        loaded.studyCount = 0;
      }
    } else {
      loaded = protectedState;
    }

    // 데이터 무결성 검증 (최소 조건)
    if (!loaded.stats || !loaded.lastActiveTime) {
      console.warn('Invalid saved state, resetting to default');
      return createDefaultState();
    }

    // Apply Migrations
    loaded = migrateLegacyData(loaded);

    // Final Safe Merge with Schema Enforcement
    const defaultState = createDefaultState();
    const finalState: NurturingPersistentState = {
      ...defaultState,
      ...loaded,
      stats: { ...defaultState.stats, ...(loaded.stats || {}) },
      tickConfig: { ...defaultState.tickConfig, ...(loaded.tickConfig || {}) },
      abandonmentState: { ...defaultState.abandonmentState, ...(loaded.abandonmentState || {}) },
      history: {
        ...defaultState.history,
        ...(loaded.history || {}),
        foodsEaten: { ...(defaultState.history?.foodsEaten || {}), ...(loaded.history?.foodsEaten || {}) },
        gamesPlayed: { ...(defaultState.history?.gamesPlayed || {}), ...(loaded.history?.gamesPlayed || {}) },
        actionsPerformed: { ...(defaultState.history?.actionsPerformed || {}), ...(loaded.history?.actionsPerformed || {}) },
        totalLifetimeGroEarned: (loaded.history?.totalLifetimeGroEarned ?? defaultState.history?.totalLifetimeGroEarned ?? 0),
      },
      currentHouseId: loaded.currentHouseId || defaultState.currentHouseId || 'tent',
      isSick: loaded.isSick ?? defaultState.isSick ?? false,
      isSleeping: loaded.isSleeping ?? defaultState.isSleeping ?? false,
      gameScores: loaded.gameScores || {},
      categoryProgress: loaded.categoryProgress || {},
      unlockedJellos: loaded.unlockedJellos || {},
      hallOfFame: loaded.hallOfFame || [],
    };

    // One-time encyclopedia init check
    if (finalState.hasCharacter && finalState.speciesId && finalState.evolutionStage) {
      // Ensure current Jello is unlocked in encyclopedia
      const list = finalState.unlockedJellos![finalState.speciesId] || [];
      if (!list.includes(finalState.evolutionStage)) {
        // Logic kept outside of here to avoid complex side effects during load
        // (Ideally handled by UI/Context when detecting state)
      }
    }

    return finalState;
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

  // 틱이 비활성화된 경우
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

  // 수면 잔여 시간 계산
  let sleepRemainingMs = 0;
  if (state.isSleeping && state.sleepStartTime) {
    const sleepDurationMs = 30 * 60 * 1000; // 30분
    const timeSinceSleepStart = state.lastActiveTime - state.sleepStartTime;
    sleepRemainingMs = Math.max(0, sleepDurationMs - timeSinceSleepStart);
  }

  // 오프라인 진행 계산
  const { finalStats, ticksElapsed, events } = calculateOfflineProgress(
    state.stats,
    state.lastActiveTime,
    currentTime,
    state.tickConfig.intervalMs,
    state.poops,
    state.bugs || [],
    state.isSleeping,
    sleepRemainingMs
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
 * [Pure] 명예의 전당 등록 (저장 부수효과 제거)
 * Returns updated state
 */
export const addToHallOfFame = (
  currentState: NurturingPersistentState,
  entry: import('../types/nurturing').HallOfFameEntry
): NurturingPersistentState => {
  return {
    ...currentState,
    hallOfFame: [...(currentState.hallOfFame || []), entry],
  };
};

/**
 * [Pure] 새로운 세대 시작 상태 생성 (저장 부수효과 제거)
 * Returns new state object
 */
export const createNewGenerationState = (
  currentState: NurturingPersistentState
): NurturingPersistentState => {
  const defaultState = createDefaultState();
  return {
    ...defaultState,
    // Keep persistent data
    gro: currentState.gro,
    totalGameStars: currentState.totalGameStars || 0, // Preserve Stars
    totalCurrencyEarned: currentState.totalCurrencyEarned,
    studyCount: currentState.studyCount,
    inventory: currentState.inventory,
    unlockedJellos: currentState.unlockedJellos,
    hallOfFame: currentState.hallOfFame || [],
    gameDifficulty: currentState.gameDifficulty,
    // Reset Character (handled by createDefaultState, but ensuring here)
    hasCharacter: false, // Will trigger egg selection
    xp: 0,
    evolutionStage: 1,
    history: {
      foodsEaten: {},
      gamesPlayed: {},
      actionsPerformed: {},
      totalLifetimeGroEarned: 0,
    },
  };
};