/**
 * Nurturing Context
 * 양육 시스템 전역 상태 관리
 */

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import type {
  NurturingStats,
  NurturingPersistentState,
  ActionResult,
  CharacterCondition,
  PendingPoop,
  Bug,
  BugType,
  AbandonmentStatusUI,
} from '../types/nurturing';
import type { FoodItem } from '../types/food';
import type { MedicineItem } from '../types/medicine';
import type { CleaningTool } from '../types/cleaning';
import {
  TICK_INTERVAL_MS,
  DEFAULT_NURTURING_STATS,
} from '../constants/nurturing';
import {
  loadNurturingState,
  saveNurturingState,
  applyOfflineProgress,
  resetNurturingState,
  createDefaultState,
  setCurrentUserId,
  saveToHallOfFame,
  startNewGeneration,
  saveFailSafeLastSeenStage,
  getFailSafeLastSeenStage
} from '../services/persistenceService';
import { CHARACTER_SPECIES } from '../data/species';
import {
  executeGameTick,
  evaluateCondition,
  clampStat,
  checkAbandonmentState,
  getAbandonmentStatusUI,
} from '../services/gameTickService';
import {
  feedCharacter as serviceFeed,
  giveMedicine as serviceGiveMedicine,
  cleanRoom as serviceClean, // Renamed from serviceCleanRoom to serviceClean
  playWithCharacter as servicePlay,
  studyWithCharacter as serviceStudy,
  takeShower as serviceTakeShower,
  brushTeeth as serviceBrushTeeth,
  removePoop,
  convertPendingToPoop,
} from '../services/actionService';
import { addXPAndCheckEvolution } from '../services/evolutionService';
import { POOP_CONFIG } from '../constants/nurturing';
import { updateCategoryProgress, parseGameScore, createGameScore, getUnlockThreshold, getProgressionCategory } from '../utils/progression';
import { GAME_ORDER } from '../constants/gameOrder';
import type { Poop, GameScoreValue } from '../types/nurturing';

interface NurturingContextValue {
  // 상태
  stats: NurturingStats;
  poops: Poop[];
  bugs: Bug[];
  gameScores?: Record<string, GameScoreValue>;
  categoryProgress?: Record<string, string>; // 카테고리별 도달한 게임 ID (해금용)
  condition: CharacterCondition;
  gro: number;
  currentLand: string;
  totalCurrencyEarned: number;
  studyCount: number;
  isTickActive: boolean;
  gameDifficulty: number | null; // 게임 난이도 (null이면 게임 중 아님)
  abandonmentStatus: AbandonmentStatusUI;  // 가출 상태
  isSick: boolean; // 질병 상태 (true면 아픔, 약으로만 치료 가능)
  maxStats: () => ActionResult;
  xp: number;
  evolutionStage: number;
  speciesId?: string;
  characterName?: string;
  unlockedJellos?: Record<string, number[]>;
  setCharacterState: (id: string, stage: number) => void;
  setCharacterName: (name: string) => void;
  addRewards: (xp: number, gro: number) => void;

  // 행동 (Actions)
  feed: (food: FoodItem) => ActionResult;
  giveMedicine: (medicine: MedicineItem) => ActionResult;
  clean: (tool: CleaningTool) => ActionResult;
  cleanBug: () => ActionResult;
  cleanAll: (cost?: number) => ActionResult;
  takeShower: () => ActionResult;
  brushTeeth: () => ActionResult;
  play: () => ActionResult;
  study: () => ActionResult;
  clickPoop: (poopId: string, happinessBonus?: number) => void;
  clickBug: (bugId: string) => void;
  spendGro: (amount: number) => boolean;
  purchaseItem: (itemId: string, price: number) => boolean;
  equipLand: (landId: string) => boolean;
  equipHouse: (houseId: string) => boolean;
  inventory: string[];

  // 유틸리티
  resetGame: () => void;
  pauseTick: () => void;
  resumeTick: () => void;
  setGameDifficulty: (difficulty: number | null) => void;
  hasCharacter: boolean;
  completeCharacterCreation: () => void;

  saveToCloud: () => Promise<boolean>;
  isEvolving: boolean;
  completeEvolutionAnimation: () => void;
  isGraduating: boolean; // Stage 4 -> Graduation
  completeGraduationAnimation: (name: string) => void;

  // Stats
  recordGameScore: (gameId: string, score: number) => void;

  // Subscription
  subscription: SubscriptionState;
  purchasePlan: (planId: '3_months' | '12_months') => Promise<boolean>;

  // Jello House & Sleep
  isSleeping: boolean;
  currentHouseId: string;
  toggleSleep: () => void;

  // Global Loading State (for initial sync)
  isGlobalLoading: boolean;
}

const NurturingContext = createContext<NurturingContextValue | undefined>(undefined);

export const useNurturing = () => {
  const context = useContext(NurturingContext);
  if (!context) {
    throw new Error('useNurturing must be used within NurturingProvider');
  }
  return context;
};

interface NurturingProviderProps {
  children: React.ReactNode;
}

import { useAuth } from './AuthContext';
import { syncUserData, fetchUserData, purchaseSubscription } from '../services/syncService';

interface SubscriptionState {
  isPremium: boolean;
  plan: '3_months' | '12_months' | null;
  expiryDate: number | null; // Timestamp
}

export const NurturingProvider: React.FC<NurturingProviderProps> = ({ children }) => {
  const { user } = useAuth(); // Import user from AuthContext

  // Global Loading State
  const [isGlobalLoading, setIsGlobalLoading] = useState(true);

  // 상태
  const [state, setState] = useState<NurturingPersistentState>(() => {
    // Initial load without user ID (will be reloaded when user is set)
    const loaded = loadNurturingState();
    const { updatedState } = applyOfflineProgress(loaded);
    saveNurturingState(updatedState);
    return updatedState;
  });

  // Subscription State (Not persistent in localStorage by default to ensure validity)
  const [subscription, setSubscription] = useState<SubscriptionState>({
    isPremium: false,
    plan: null,
    expiryDate: null,
  });

  // Purchase Plan Handlere
  const purchasePlan = useCallback(async (planId: '3_months' | '12_months'): Promise<boolean> => {
    if (!user) return false;

    console.log(`Processing purchase for plan: ${planId}`);
    const result = await purchaseSubscription(user, planId);

    if (result.success) {
      console.log('Purchase successful!', result);
      setSubscription({
        isPremium: !!result.is_premium,
        plan: result.plan as any,
        expiryDate: result.subscription_end || null,
      });
      return true;
    } else {
      console.error('Purchase failed.');
      return false;
    }
  }, [user]);



  // Track user changes and update storage key
  useEffect(() => {
    setCurrentUserId(user?.uid || null);

    // reset global loading when user changes (will trigger new fetch)
    if (user?.uid) {
      setIsGlobalLoading(true);
    } else {
      // If no user (logout), we are "done" loading (guest mode active)
      setIsGlobalLoading(false);
    }

    // When user changes, reload their data
    if (user?.uid) {
      console.log('🔄 User changed, loading user-specific data for:', user.uid);
      const userState = loadNurturingState();
      const { updatedState } = applyOfflineProgress(userState);

      // Sync independent key if state has higher value
      if (updatedState.lastSeenStage) {
        const currentStored = getFailSafeLastSeenStage() || 0;
        if (updatedState.lastSeenStage > currentStored) {
          saveFailSafeLastSeenStage(updatedState.lastSeenStage);
        }
      }

      setState(updatedState);
      // saveNurturingState removed
    }
  }, [user?.uid]);
  // ... (previous useEffects) ...

  // ==================== HYBRID STORAGE: Cloud Sync on Login ====================
  // On login: D1 data is trusted and overwrites localStorage
  // This ensures cross-device consistency
  useEffect(() => {
    if (!user) {
      // Ensure loading is false if no user
      setIsGlobalLoading(false);
      return;
    }

    // Force loading true at start of sync attempt
    setIsGlobalLoading(true);

    console.log('☁️ Fetching cloud data for user:', user.uid);
    fetchUserData(user).then((result) => {
      // DEBUG LOGS
      if (result.success && result.data) {
        // Proceed with parsing...
      } else {
        // No valid data
      }


      if (!result.success) {
        if (result.notFound) {
          // New user: no cloud data exists
          // If local guest has progress (hasCharacter), sync it.
          // Otherwise, sync a fresh clean state to avoid garbage data.
          console.log('☁️ New user detected.');
          if (stateRef.current.hasCharacter) {
            console.log('☁️ Syncing guest progress to new account.');
            // Promote Guest: Sync local state to Cloud AND re-save to Local with user ID
            const guestState = stateRef.current;
            syncUserData(user, guestState);
            saveNurturingState(guestState, user.uid); // Lock this data to the new user ID
          } else {
            console.log('☁️ Initializing fresh account state.');
            // Fresh Start: Create clean state, Sync to Cloud, AND Overwrite Local with user ID
            const cleanState = createDefaultState();
            syncUserData(user, cleanState);
            setState({ ...cleanState, lastActiveTime: Date.now() });
            saveNurturingState(cleanState, user.uid); // Ensure local storage is wiped of old guest data
          }
        } else {
          console.warn('☁️ Fetch failed:', result.error);
        }
        return;
      }

      // Cloud data exists: parse and use it
      const cloudData = result.data;

      // Update Subscription State
      if (cloudData.is_premium !== undefined) {
        setSubscription({
          isPremium: !!cloudData.is_premium,
          plan: cloudData.subscription_plan as any || null,
          expiryDate: cloudData.subscription_end || null,
        });
      }

      let parsedGameData = cloudData.gameData || cloudData.game_data;

      // Handle JSON string (D1 returns string)
      if (typeof parsedGameData === 'string') {
        try {
          parsedGameData = JSON.parse(parsedGameData);
        } catch (e) {
          console.error('Failed to parse game_data:', e);
          return;
        }
      }

      if (!parsedGameData || typeof parsedGameData !== 'object') {
        console.warn('☁️ Invalid game_data, keeping local state');
        return;
      }

      console.log('☁️ Cloud data found. Checking versions...');



      // Smart Sync: Compare local vs cloud timestamps
      // If local data is significantly newer (e.g. > 1 minute), keep local and push to cloud
      // This prevents "Return to Previous" issues on refresh/cross-device
      const cloudTime = parsedGameData.lastActiveTime || 0;
      const localTime = stateRef.current.lastActiveTime || 0;

      // Use a tolerance of 5 seconds to avoid clock skew issues

      // FIX (Zero Stats Bug): Check if local data is "broken" or invalid (e.g. all zeros)
      // If local stats are suspicious, we should TRUST CLOUD regardless of timestamps.
      const isLocalInvalid =
        stateRef.current.stats.health === 0 &&
        stateRef.current.stats.fullness === 0 &&
        stateRef.current.stats.happiness === 0;

      const isLocalFresh =
        stateRef.current.xp === 0 &&
        stateRef.current.totalCurrencyEarned === 0 &&
        !stateRef.current.hasCharacter;

      // Only keep local if it's NEWER AND (Valid AND Not Fresh)
      if (localTime > cloudTime + 5000 && !isLocalFresh && !isLocalInvalid) {
        console.log(`☁️ Cloud data is stale! (Local: ${new Date(localTime).toLocaleTimeString()} vs Cloud: ${new Date(cloudTime).toLocaleTimeString()})`);
        console.log('☁️ Keeping local data (Lazy Sync: will sync on next auto-save/logout)');
        // FIX: Do NOT write to cloud immediately to save costs.
        return;
      }

      if (isLocalInvalid) {
        console.warn('⚠️ Local state appears broken (0/0/0). Forcing Cloud Restore.');
      }

      console.log('☁️ Cloud data is newer or consistent. Restoring from cloud.');

      // Use createDefaultState() as a base to ensure new fields are present
      const defaultState = createDefaultState();

      const restoredState: NurturingPersistentState = {
        ...defaultState,
        ...parsedGameData,
        // Ensure lastActiveTime is updated to now if we just pulled it
        lastActiveTime: Date.now(),
      };

      // ===== MIGRATION: Legacy minigameStats -> gameScores =====
      // If cloud has old format (minigameStats), convert to new format (gameScores)
      if (parsedGameData.minigameStats && !parsedGameData.gameScores) {
        console.log('☁️ [MIGRATION] Converting legacy minigameStats to gameScores...');
        const migratedScores: Record<string, GameScoreValue> = {};

        for (const [gameId, stats] of Object.entries(parsedGameData.minigameStats)) {
          const category = getProgressionCategory(gameId);
          const threshold = category ? getUnlockThreshold(category) : 4;
          const isUnlocked = stats.playCount >= threshold;

          migratedScores[gameId] = createGameScore(
            stats.highScore,
            stats.playCount,
            isUnlocked
          );
        }

        restoredState.gameScores = migratedScores;
        // Clear legacy fields
        delete restoredState.minigameStats;
        delete restoredState.totalMinigameScore;
        delete restoredState.totalMinigamePlayCount;
      } else {
        // Use new format directly
        restoredState.gameScores = parsedGameData.gameScores || {};
      }

      // Restore categoryProgress (direct from cloud, no reconciliation needed)
      restoredState.categoryProgress = parsedGameData.categoryProgress || {};

      // Legacy Safety: If categoryProgress is empty but local has data, keep local
      if (Object.keys(restoredState.categoryProgress).length === 0) {
        if (stateRef.current.categoryProgress && Object.keys(stateRef.current.categoryProgress).length > 0) {
          console.log('☁️ Legacy Cloud Data detected (Missing categoryProgress). Merging Local Progress.');
          restoredState.categoryProgress = { ...stateRef.current.categoryProgress };
        }
      }

      // ===== Hybrid Storage v2.1: Regenerate poop/bug arrays from counts =====
      // Cloud data stores counts only, regenerate full arrays with random positions
      const compactData = parsedGameData as any;

      // Regenerate poops from count
      if (compactData.poopCount !== undefined && !compactData.poops) {
        console.log('☁️ [v2.1] Regenerating poops from count:', compactData.poopCount);
        const regeneratedPoops: Poop[] = [];
        for (let i = 0; i < compactData.poopCount; i++) {
          regeneratedPoops.push({
            id: `poop-regen-${Date.now()}-${i}`,
            x: 20 + Math.random() * 60,
            y: 20 + Math.random() * 60,
            createdAt: Date.now(),
            healthDebuff: -5,
          });
        }
        restoredState.poops = regeneratedPoops;
      }

      // Regenerate bugs from counts
      if (compactData.bugCounts && !compactData.bugs) {
        console.log('☁️ [v2.1] Regenerating bugs from counts:', compactData.bugCounts);
        const regeneratedBugs: Bug[] = [];
        for (const [bType, count] of Object.entries(compactData.bugCounts as Record<string, number>)) {
          for (let j = 0; j < count; j++) {
            regeneratedBugs.push({
              id: `bug-regen-${Date.now()}-${bType}-${j}`,
              type: bType as BugType,
              x: 20 + Math.random() * 60,
              y: 20 + Math.random() * 60,
              createdAt: Date.now(),
              healthDebuff: -0.5,
              happinessDebuff: -0.5,
            });
          }
        }
        restoredState.bugs = regeneratedBugs;
      }

      // Regenerate pending poops from count
      if (compactData.pendingPoopCount !== undefined && !compactData.pendingPoops) {
        console.log('☁️ [v2.1] Regenerating pending poops from count:', compactData.pendingPoopCount);
        const regeneratedPending: PendingPoop[] = [];
        for (let k = 0; k < compactData.pendingPoopCount; k++) {
          regeneratedPending.push({
            id: `pending-regen-${Date.now()}-${k}`,
            scheduledAt: Date.now() + (k + 1) * 60000,
            healthDebuff: -5,
          });
        }
        restoredState.pendingPoops = regeneratedPending;
      }

      // Ensure lastSeenStage logic is consistent with evolutionStage
      if (parsedGameData.lastSeenStage === undefined) {
        restoredState.lastSeenStage = restoredState.evolutionStage;
      }


      setState(restoredState);

      // Initialize lastSyncedStateRef with the data we just loaded/restored
      /// to prevent immediate auto-save if nothing changes
      lastSyncedStateRef.current = JSON.stringify(restoredState);

      // saveNurturingState(restoredState); // Handled by throttle
    }).finally(() => {
      // ALWAYS finish loading state regardless of outcome
      setIsGlobalLoading(false);
    });
  }, [user]);

  // Keep state ref for event handlers (if needed for timer)
  const lastSyncedStateRef = useRef<string | null>(null);
  const stateRef = useRef(state);
  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  // Cloud Sync: Auto-Save every 15 minutes (RESTORED)
  useEffect(() => {
    if (!user) return;

    const AUTO_SAVE_INTERVAL = 15 * 60 * 1000; // 15 minutes
    console.log('☁️ Auto-save timer started');

    const timer = setInterval(() => {
      // Use ref to avoid resetting timer on state change
      if (stateRef.current) {
        const currentStateStr = JSON.stringify(stateRef.current);

        // Dirty Check: Skip sync if state hasn't changed since last sync
        if (lastSyncedStateRef.current === currentStateStr) {
          console.log('☁️ Auto-save skipped: No changes detected.');
          return;
        }

        console.log('☁️ Auto-save triggered: Changes detected.');
        syncUserData(user, stateRef.current).then(success => {
          if (success) {
            lastSyncedStateRef.current = currentStateStr;
          }
        });
      }
    }, AUTO_SAVE_INTERVAL);

    return () => clearInterval(timer);
  }, [user]); // Only restart if User changes. State is accessed via Ref.

  // Manual Save Function (Exposed)
  const saveToCloud = useCallback(async () => {
    if (!user) return false;

    // DEBUG LOGS
    const safeState = stateRef.current; // Use Ref to ensure freshness
    console.log('☁️ [DEBUG] Manual Save Triggered.');

    // Optimistic: Update ref immediately? No, wait for success.
    const success = await syncUserData(user, safeState);
    if (success) {
      lastSyncedStateRef.current = JSON.stringify(safeState);
    }
    return success;
  }, [user]); // Removed state dependency since we use valid ref

  // ... existing code ...

  const addRewards = useCallback((xpAmount: number, groAmount: number) => {
    setState((currentState) => {
      // Get unlock conditions for stage 5 if relevant
      // We look up species data if we have an ID
      let conditions = undefined;
      if (currentState.speciesId && CHARACTER_SPECIES[currentState.speciesId]) {
        // Stage 5 is index 4 if array is 0-indexed, but evolutions array structure in species.ts:
        // evolutions: [ {stage: 1..}, {stage: 2..} ..]
        // Actually, let's verify species.ts structure.
        // Usually it's an array. If we want stage 5, we look for stage 5 entry.
        const species = CHARACTER_SPECIES[currentState.speciesId];
        const stage5 = species.evolutions.find(e => e.stage === 5);
        if (stage5) {
          conditions = stage5.unlockConditions;
        }
      }

      const { newXP, newStage, evolved, canGraduate } = addXPAndCheckEvolution(
        currentState.xp || 0,
        (currentState.evolutionStage || 1) as import('../types/character').EvolutionStage,
        xpAmount,
        currentState.history,
        conditions
      );

      // Trigger animation if stage changed
      // Note: We don't set isEvolving here directly to keep it decoupled, 
      // but if we wanted to be explicit we could.
      // However, the useEffect below watches for stage change.

      // Handle Graduation
      if (canGraduate) {
        setIsGraduating(true);
      }

      // Handle Evolution (useEffect handles this usually, but let's double check)
      // The existing useEffect relies on state.evolutionStage changing.
      // If evolved is true, state.evolutionStage will change below.

      // Persist Species if Stage 4 (Branching) or earlier
      // ... (existing logic)oAmount,
      const newState = {
        ...currentState,
        xp: newXP,
        evolutionStage: newStage,
        gro: (currentState.gro || 0) + groAmount,
        totalCurrencyEarned: (currentState.totalCurrencyEarned || 0) + groAmount,
      };

      // Encyclopedia Unlock Logic
      if (evolved && currentState.speciesId) {
        const speciesId = currentState.speciesId;
        const unlockedMap = newState.unlockedJellos || {};
        const currentUnlocks = unlockedMap[speciesId] || [];

        if (!currentUnlocks.includes(newStage)) {
          // Add new stage
          const updatedUnlocks = [...currentUnlocks, newStage].sort((a, b) => a - b);
          newState.unlockedJellos = {
            ...unlockedMap,
            [speciesId]: updatedUnlocks
          };
        }
      }


      if (evolved) {
        console.log(`🎉 EVOLUTION! Stage ${newStage}`);
        // Animation handled by useEffect monitoring state.evolutionStage
      }

      // saveNurturingState(newState); // Handled by throttle
      // Removed immediate syncUserData(user, newState);
      return newState;
    });
  }, [user]);

  // ... (existing actions) ...

  const purchaseItem = useCallback((itemId: string, price: number): boolean => {
    let success = false;
    setState((currentState) => {
      // 이미 보유 중이면 성공 처리 (돈 차감 안 함)
      if (currentState.inventory?.includes(itemId)) {
        success = true;
        return currentState;
      }

      // 돈 부족
      if ((currentState.gro || 0) < price) {
        success = false;
        return currentState;
      }

      success = true;
      const newState = {
        ...currentState,
        gro: (currentState.gro || 0) - price,
        inventory: [...(currentState.inventory || []), itemId],
      };
      // saveNurturingState(newState); // Handled by throttle
      // Removed immediate syncUserData(user, newState);
      return newState;
    });
    return success;
  }, [user]);

  const equipLand = useCallback((landId: string): boolean => {
    let success = false;
    setState((currentState) => {
      // Must own the item or it be default
      if (landId !== 'default_ground' && !currentState.inventory?.includes(landId)) {
        console.warn('Cannot equip land not in inventory:', landId);
        return currentState;
      }

      success = true;
      const newState = {
        ...currentState,
        currentLand: landId,
      };
      // saveNurturingState(newState); // Handled by throttle
      return newState;
    });
    return success;
  }, []);

  const equipHouse = useCallback((houseId: string): boolean => {
    let success = false;
    setState((currentState) => {
      // Allow 'tent' by default or check inventory
      if (houseId !== 'tent' && !currentState.inventory?.includes(houseId)) {
        console.warn('Cannot equip house not in inventory:', houseId);
        return currentState;
      }

      success = true;
      const newState = {
        ...currentState,
        currentHouseId: houseId,
      };
      // saveNurturingState(newState); // Handled by throttle
      return newState;
    });
    return success;
  }, []);

  const recordGameScore = useCallback((gameId: string, score: number) => {
    setState(currentState => {
      const scoresMap = currentState.gameScores || {};
      const currentValue = scoresMap[gameId];
      const { highScore: oldHigh, clearCount: oldCount } = parseGameScore(currentValue);

      // Calculate new values
      const newHighScore = Math.max(oldHigh, score);
      const newClearCount = oldCount + 1;

      // Check unlock threshold for this game's category
      const category = getProgressionCategory(gameId);
      const threshold = category ? getUnlockThreshold(category) : 4;
      const isUnlocked = newClearCount >= threshold;

      // Create compact score value
      const newScoreValue = createGameScore(newHighScore, newClearCount, isUnlocked);

      // Update categoryProgress if unlock threshold is met
      let updatedCategoryProgress = currentState.categoryProgress;
      if (isUnlocked && category) {
        const order = GAME_ORDER[category];
        const currentIndex = order.indexOf(gameId);
        const nextGameId = order[currentIndex + 1];
        if (nextGameId) {
          updatedCategoryProgress = updateCategoryProgress(
            nextGameId,
            currentState.categoryProgress
          );
        }
      }

      const newState = {
        ...currentState,
        gameScores: {
          ...scoresMap,
          [gameId]: newScoreValue
        },
        categoryProgress: updatedCategoryProgress,
      };

      // Force Immediate Save to Local Storage (Critical for progression)
      saveNurturingState(newState, user?.uid);

      return newState;
    });
  }, [user?.uid]);

  const [condition, setCondition] = useState<CharacterCondition>(() =>
    evaluateCondition(state.stats)
  );

  const tickIntervalRef = useRef<number | null>(null);

  // 게임 틱 실행
  const runGameTick = useCallback(() => {
    setState((currentState) => {
      // Auto-Wake Check (30 mins = 1800000 ms)
      let isStillSleeping = currentState.isSleeping || false;
      if (isStillSleeping && currentState.sleepStartTime) {
        const sleepDuration = Date.now() - currentState.sleepStartTime;
        if (sleepDuration >= 30 * 60 * 1000) {
          isStillSleeping = false;
          console.log('⏰ 30분 경과: 젤로가 잠에서 깨어났습니다!');
          // 여기에 알림 메시지를 추가할 수도 있음
        }
      }

      // 3. 게임 틱 실행
      const tickResult = executeGameTick(
        currentState.stats,
        currentState.poops,
        currentState.bugs || [],
        currentState.gameDifficulty ?? null,
        currentState.isSick, // 현재 질병 상태 전달
        isStillSleeping // 수면 상태 전달
      );

      // 새 스탯 계산
      const newStats: NurturingStats = {
        fullness: clampStat(currentState.stats.fullness + (tickResult.statChanges.fullness || 0)),
        health: clampStat(currentState.stats.health + (tickResult.statChanges.health || 0)),
        happiness: clampStat(currentState.stats.happiness + (tickResult.statChanges.happiness || 0)),
      };

      // 예약된 똥 처리: 시간이 된 것들을 실제 똥으로 변환
      const now = Date.now();
      const pendingPoops = currentState.pendingPoops || [];
      const readyPoops = pendingPoops.filter(p => p.scheduledAt <= now);
      const remainingPendingPoops = pendingPoops.filter(p => p.scheduledAt > now);

      // 새로 생성된 똥들
      let newPoops = [...currentState.poops];
      readyPoops.forEach(pending => {
        if (newPoops.length < POOP_CONFIG.MAX_POOPS) {
          const newPoop = convertPendingToPoop(pending);
          newPoops.push(newPoop);
          // 똥 생성 시 건강 감소
          newStats.health = clampStat(newStats.health + pending.healthDebuff);
          console.log('💩 똥이 나왔어요!');
        }
      });

      // 가출 상태 체크
      const updatedAbandonmentState = checkAbandonmentState(
        newStats,
        currentState.abandonmentState,
        Date.now()
      );

      const newState: NurturingPersistentState = {
        ...currentState,
        stats: newStats,
        poops: newPoops,
        bugs: tickResult.newBugs || currentState.bugs,
        isSick: tickResult.newIsSick, // 질병 상태 업데이트
        sickProgress: tickResult.newIsSick && !currentState.isSick ? 0 : currentState.sickProgress, // 새로 아프면 진행도 초기화
        pendingPoops: remainingPendingPoops,
        abandonmentState: updatedAbandonmentState,

        lastActiveTime: Date.now(),
        // 수면 상태 업데이트 (Auto-wake 반영)
        isSleeping: isStillSleeping,
        sleepStartTime: isStillSleeping ? currentState.sleepStartTime : undefined,
        tickConfig: {
          ...currentState.tickConfig,
          lastTickTime: Date.now(),
        },
      };

      // 저장
      // saveNurturingState(newState); // Handled by throttle

      // 조건 업데이트
      setCondition(tickResult.condition);

      // 알림 출력 (콘솔)
      if (tickResult.alerts.length > 0) {
        tickResult.alerts.forEach(alert => console.log('[Game Tick]', alert));
      }

      return newState;
    });
  }, []);

  // 게임 틱 시작
  useEffect(() => {
    // 로그아웃 상태이거나 틱 비활성화 시 중단
    if (!user || !state.tickConfig.isActive) {
      // 이미 실행 중인 인터벌이 있으면 정리
      if (tickIntervalRef.current) {
        clearInterval(tickIntervalRef.current);
        tickIntervalRef.current = null;
      }
      return;
    }

    console.log('⏰ Tick started (Interval set)');

    // 인터벌 설정
    tickIntervalRef.current = window.setInterval(() => {
      runGameTick();
    }, TICK_INTERVAL_MS);

    return () => {
      if (tickIntervalRef.current) {
        clearInterval(tickIntervalRef.current);
      }
    };
  }, [state.tickConfig.isActive, runGameTick, user]);

  // ==================== 행동 함수 ====================

  // ==================== 행동 함수 (Actions) ====================

  /**
   * 상태 업데이트를 처리하는 제네릭 헬퍼 함수
   * 중복되는 상태 저장, 조건 평가, 리턴 처리를 통합
   */
  const performAction = useCallback(<T extends ActionResult>(
    actionFn: (currentState: NurturingPersistentState) => T,
    onSuccess?: (result: T, newState: NurturingPersistentState) => Partial<NurturingPersistentState>
  ): T => {
    let result: T = { success: false, statChanges: {} } as T;

    setState((currentState) => {
      // 1. 서비스 함수 실행
      result = actionFn(currentState);

      if (!result.success) {
        return currentState;
      }

      // 2. 기본 스탯 업데이트 (모든 행동 공통)
      const currentStats = currentState.stats;
      const statChanges = result.statChanges || {};

      const newStats: NurturingStats = {
        fullness: clampStat(currentStats.fullness + (statChanges.fullness || 0)),
        health: clampStat(currentStats.health + (statChanges.health || 0)),
        happiness: clampStat(currentStats.happiness + (statChanges.happiness || 0)),
      };

      // 3. 기본 새 상태 생성
      let newState: NurturingPersistentState = {
        ...currentState,
        stats: newStats,
        lastActiveTime: Date.now(),
      };

      // 4. 추가 상태 업데이트 (콜백)
      if (onSuccess) {
        const additionalUpdates = onSuccess(result, newState);
        newState = { ...newState, ...additionalUpdates };
      }

      // 5. 저장 및 조건 평가
      // saveNurturingState(newState); // Handled by throttle
      // 질병 상태가 변경되었을 수 있으므로 newState.isSick 확인
      setCondition(evaluateCondition(newState.stats, newState.isSick));

      return newState;
    });

    return result;
  }, []);

  const feed = useCallback((food: FoodItem): ActionResult => {
    return performAction(
      (currentState) => serviceFeed(currentState.stats, food.id, currentState.poops, currentState.pendingPoops || []),
      (result, _newState) => {
        // Update history
        const newHistory = {
          ...(_newState.history || {
            foodsEaten: {}, gamesPlayed: {}, actionsPerformed: {}, totalLifetimeGroEarned: 0
          })
        };
        newHistory.foodsEaten = { ...newHistory.foodsEaten };
        newHistory.foodsEaten[food.id] = (newHistory.foodsEaten[food.id] || 0) + 1;

        // 예약된 똥 처리
        if ('pendingPoopScheduled' in result && result.pendingPoopScheduled) {
          const pending = result.pendingPoopScheduled as PendingPoop;
          console.log('💩 똥 예약됨!', Math.round((pending.scheduledAt - Date.now()) / 1000), '초 후');
          return {
            pendingPoops: [...(_newState.pendingPoops || []), pending],
            history: newHistory
          };
        }
        return { history: newHistory };
      }
    );
  }, [performAction]);

  const giveMedicine = useCallback((medicine: MedicineItem): ActionResult => {
    return performAction(
      (currentState) => serviceGiveMedicine(currentState.stats, medicine.id, currentState.isSick),
      (result, currentState) => {
        const newHistory = {
          ...(currentState.history || {
            foodsEaten: {}, gamesPlayed: {}, actionsPerformed: {}, totalLifetimeGroEarned: 0
          })
        };
        newHistory.actionsPerformed = { ...newHistory.actionsPerformed };
        newHistory.actionsPerformed['giveMedicine'] = (newHistory.actionsPerformed['giveMedicine'] || 0) + 1;

        // 질병 치료 진행도 처리
        let newIsSick = currentState.isSick;
        let newSickProgress = currentState.sickProgress || 0;

        // 타입 가드: cureProgressDelta가 있는지 확인
        const cureDelta = (result as any).cureProgressDelta;

        if (cureDelta && cureDelta > 0) {
          newSickProgress += cureDelta;
          if (newSickProgress >= 2) {
            newIsSick = false;
            newSickProgress = 0;
            console.log('💊 질병이 완치되었습니다!');
          } else {
            console.log(`💊 치료 진행 중... (${newSickProgress}/2)`);
          }
        }
        return { isSick: newIsSick, sickProgress: newSickProgress, history: newHistory };
      }
    );
  }, [performAction]);

  const clean = useCallback((_tool: CleaningTool): ActionResult => {
    return performAction(
      (currentState) => serviceClean(currentState.stats, currentState.poops),
      (_result, currentState) => {
        const newHistory = {
          ...(currentState.history || {
            foodsEaten: {}, gamesPlayed: {}, actionsPerformed: {}, totalLifetimeGroEarned: 0
          })
        };
        newHistory.actionsPerformed = { ...newHistory.actionsPerformed };
        newHistory.actionsPerformed['clean'] = (newHistory.actionsPerformed['clean'] || 0) + 1;

        return { poops: [], history: newHistory };
      }
    );
  }, [performAction]);

  const play = useCallback((): ActionResult => {
    return performAction((currentState) => servicePlay(currentState.stats),
      (_result, currentState) => {
        const newHistory = {
          ...(currentState.history || {
            foodsEaten: {}, gamesPlayed: {}, actionsPerformed: {}, totalLifetimeGroEarned: 0
          })
        };
        newHistory.actionsPerformed = { ...newHistory.actionsPerformed };
        newHistory.actionsPerformed['play'] = (newHistory.actionsPerformed['play'] || 0) + 1;
        // Note: Specific game stats are handled in specific game components/pages usually, 
        // but generic 'play' action is tracked here.
        return { history: newHistory };
      });
  }, [performAction]);

  const study = useCallback((): ActionResult => {
    return performAction(
      (currentState) => serviceStudy(currentState.stats),
      (result, currentState) => {
        const currencyEarned = result.sideEffects?.currencyEarned || 0;

        const newHistory = {
          ...(currentState.history || {
            foodsEaten: {}, gamesPlayed: {}, actionsPerformed: {}, totalLifetimeGroEarned: 0
          })
        };
        newHistory.actionsPerformed = { ...newHistory.actionsPerformed };
        newHistory.actionsPerformed['study'] = (newHistory.actionsPerformed['study'] || 0) + 1;
        newHistory.totalLifetimeGroEarned = (newHistory.totalLifetimeGroEarned || 0) + currencyEarned;

        return {
          gro: (currentState.gro || 0) + currencyEarned,
          totalCurrencyEarned: currentState.totalCurrencyEarned + currencyEarned,
          studyCount: currentState.studyCount + 1,
          history: newHistory
        };
      }
    );
  }, [performAction]);

  const spendGro = useCallback((amount: number): boolean => {
    let success = false;
    setState((currentState) => {
      if ((currentState.gro || 0) < amount) {
        success = false;
        return currentState;
      }

      success = true;
      const newState = {
        ...currentState,
        gro: (currentState.gro || 0) - amount,
      };
      // saveNurturingState(newState); // Handled by throttle
      return newState;
    });
    return success;
  }, []);

  const cleanAll = useCallback((cost: number = 0): ActionResult => {
    let result: ActionResult = { success: false, statChanges: {} };

    setState((currentState) => {
      // 1. Check Money
      if ((currentState.gro || 0) < cost) {
        result = { success: false, statChanges: {}, message: '돈이 부족해요!' };
        return currentState;
      }

      const poopCount = currentState.poops.length;
      const bugCount = (currentState.bugs || []).length;

      if (poopCount === 0 && bugCount === 0) {
        // Technically this check is done in UI, but good for safety
        result = { success: false, statChanges: {}, message: '청소할 것이 없어요.' };
        return currentState;
      }

      // Bonus Calculation
      // Poop: +2 Health, +2 Happiness
      // Bug: +1 Health, +3 Happiness
      const healthBonus = (poopCount * 2) + (bugCount * 1);
      const happinessBonus = (poopCount * 2) + (bugCount * 3);

      const newStats: NurturingStats = {
        ...currentState.stats,
        happiness: clampStat(currentState.stats.happiness + happinessBonus),
        health: clampStat(currentState.stats.health + healthBonus),
      };

      const newState: NurturingPersistentState = {
        ...currentState,
        gro: (currentState.gro || 0) - cost,
        stats: newStats,
        poops: [],
        bugs: [],
        lastActiveTime: Date.now(),
      };

      // saveNurturingState(newState); // Handled by throttle
      setCondition(evaluateCondition(newStats));

      result = {
        success: true,
        statChanges: { happiness: happinessBonus, health: healthBonus },
        message: `말끔히 청소했어요! (똥 ${poopCount}, 벌레 ${bugCount})`
      };

      return newState;
    });

    return result;
  }, []);

  const maxStats = useCallback((): ActionResult => {
    // maxStats는 로직이 단순해서 performAction을 안쓰고 직접 set하지만, 일관성을 위해 래핑 가능
    // 단, maxStats는 'stats'를 강제로 덮어씌우므로 performAction의 상대적 업데이트와 다름.
    // 별도 유지 혹은 performAction 수정 필요. 여기서는 기존 유지하되 중복만 제거.
    // ...기존 로직이 더 직관적이므로 maxStats는 유지.
    let result: ActionResult = { success: true, statChanges: {}, message: '회복됨' };
    setState((currentState) => {
      const newStats = { fullness: 100, health: 100, happiness: 100 };
      const newState = {
        ...currentState,
        stats: newStats,
        isSick: false,
        sickProgress: 0,
        lastActiveTime: Date.now(),
      };
      // saveNurturingState(newState); // Handled by throttle
      setCondition(evaluateCondition(newStats));
      result = { success: true, statChanges: newStats, message: '모든 상태가 회복되었습니다!' };
      return newState;
    });
    return result;
  }, []);

  const takeShower = useCallback((): ActionResult => {
    return performAction((currentState) => serviceTakeShower(currentState.stats));
  }, [performAction]);

  const brushTeeth = useCallback((): ActionResult => {
    return performAction((currentState) => serviceBrushTeeth(currentState.stats));
  }, [performAction]);

  const clickPoop = useCallback((poopId: string, happinessBonus: number = 0) => {
    setState((currentState) => {
      const { updatedPoops, removed } = removePoop(poopId, currentState.poops);

      if (!removed) {
        return currentState;
      }

      const newStats: NurturingStats = {
        ...currentState.stats,
        happiness: clampStat(currentState.stats.happiness + happinessBonus),
        health: clampStat(currentState.stats.health + 2), // Broom Effect: +2 Health
      };

      const newState: NurturingPersistentState = {
        ...currentState,
        stats: newStats,
        poops: updatedPoops,
      };

      // saveNurturingState(newState); // Handled by throttle
      setCondition(evaluateCondition(newStats));

      return newState;
    });
  }, []);

  const clickBug = useCallback((bugId: string) => {
    setState((currentState) => {
      const bugs = currentState.bugs || [];
      const bugToRemove = bugs.find(b => b.id === bugId);

      if (!bugToRemove) {
        return currentState;
      }

      const updatedBugs = bugs.filter(b => b.id !== bugId);

      const newStats: NurturingStats = {
        ...currentState.stats,
        happiness: clampStat(currentState.stats.happiness + 3),
        health: clampStat(currentState.stats.health + 1),
      };

      const newState: NurturingPersistentState = {
        ...currentState,
        stats: newStats,
        bugs: updatedBugs,
      };

      // saveNurturingState(newState); // Handled by throttle
      setCondition(evaluateCondition(newStats)); // Condition update needed

      return newState;
    });
  }, []);

  const cleanBug = useCallback((): ActionResult => {
    let result: ActionResult = { success: false, statChanges: {} };

    setState((currentState) => {
      const bugs = currentState.bugs || [];

      if (bugs.length === 0) {
        result = { success: false, statChanges: {}, message: '제거할 벌레가 없습니다.' };
        return currentState;
      }

      // 벌레 1마리 제거
      const updatedBugs = bugs.slice(1);

      const newStats: NurturingStats = {
        ...currentState.stats,
        happiness: clampStat(currentState.stats.happiness + 3),
        health: clampStat(currentState.stats.health + 1),
      };

      const newState: NurturingPersistentState = {
        ...currentState,
        stats: newStats,
        bugs: updatedBugs,
        lastActiveTime: Date.now(),
      };

      // saveNurturingState(newState); // Handled by throttle
      setCondition(evaluateCondition(newStats));

      result = { success: true, statChanges: { happiness: 3, health: 1 }, message: '벌레 1마리를 제거했습니다!' };

      return newState;
    });

    return result;
  }, []);

  const resetGame = useCallback(() => {
    setState((currentState) => {
      // Keep existing Gro
      const existingGro = currentState.gro || 20;

      const newState = resetNurturingState();

      const preservedState = {
        ...newState,
        gro: existingGro,
        hasCharacter: false, // Reset character state
        gameDifficulty: null, // Reset game difficulty
      };

      // saveNurturingState(preservedState); // Handled by throttle

      // Force Sync to Cloud immediately to preventing "Zombie Data" restoration
      // (Otherwise, "Fresh State" logic would overwrite this reset with old cloud data)
      if (user) {
        syncUserData(user, preservedState);
      }

      return preservedState;
    });
    // setCondition is updated via state change effect or we can calculate it manually if needed, 
    // but setState is async-ish. However, for immediate feedback:
    setCondition(evaluateCondition(DEFAULT_NURTURING_STATS));
  }, []);

  const completeCharacterCreation = useCallback(() => {
    setState((currentState) => {
      const newState = {
        ...currentState,
        hasCharacter: true,
      };
      // saveNurturingState(newState); // Handled by throttle
      // Sync to cloud immediately to persist character creation
      if (user) {
        syncUserData(user, newState);
      }
      return newState;
    });
  }, [user]);

  const pauseTick = useCallback(() => {
    console.log('⏸️ Pausing tick...');
    setState((currentState) => {
      const newState: NurturingPersistentState = {
        ...currentState,
        tickConfig: {
          ...currentState.tickConfig,
          isActive: false,
        },
      };
      // saveNurturingState(newState); // Handled by throttle
      return newState;
    });
  }, []);

  const resumeTick = useCallback(() => {
    setState((currentState) => {
      if (currentState.tickConfig.isActive) {
        return currentState;
      }
      console.log('▶️ Resuming tick...');
      const newState: NurturingPersistentState = {
        ...currentState,
        tickConfig: {
          ...currentState.tickConfig,
          isActive: true,
        },
      };
      // saveNurturingState(newState); // Handled by throttle
      return newState;
    });
  }, []);

  const setGameDifficulty = useCallback((difficulty: number | null) => {
    console.log(`🎮 Game Difficulty Set: ${difficulty}`);
    setState((currentState) => {
      const newState: NurturingPersistentState = {
        ...currentState,
        gameDifficulty: difficulty,
      };
      // saveNurturingState(newState); // Handled by throttle
      return newState;
    });
  }, []);

  // Evolution Animation State (Transient)
  const [isEvolving, setIsEvolving] = useState(false);

  const completeEvolutionAnimation = useCallback(() => {
    setState(currentState => {
      const newState = {
        ...currentState,
        lastSeenStage: currentState.evolutionStage
      };

      // Emergency Persistence: Save to independent key
      saveFailSafeLastSeenStage(currentState.evolutionStage);

      // saveNurturingState(newState); // Handled by throttle
      // Essential: immediate cloud save to lock in this milestone (Evolution)
      if (user) {
        console.log('☁️ Evolution milestone reached. Syncing to cloud...');
        syncUserData(user, newState);
      }
      return newState;
    });
    setIsEvolving(false);
  }, [user]);

  // Graduation Animation State
  const [isGraduating, setIsGraduating] = useState(false);

  const completeGraduationAnimation = useCallback((name: string) => {
    // 1. Create Hall Of Fame Entry
    const entry: import('../types/nurturing').HallOfFameEntry = {
      id: Date.now().toString(),
      name: name || 'Jello',
      speciesId: state.speciesId || 'yellowJello',
      finalStage: state.evolutionStage || 4,
      graduatedAt: Date.now(),
      finalStats: state.stats
    };

    // 2. Save Entry to Persistent Storage
    let nextState = saveToHallOfFame(state, entry);

    // 3. Reset Game (Soft Reset)
    nextState = startNewGeneration(nextState);

    // 4. Update State
    setState(nextState);
    setIsGraduating(false);
    setIsEvolving(false); // Force clear any pending evolution animation (e.g. from debug trigger)
  }, [state]);

  // Updated to handle both species and stage (from Gallery/Admin)
  const setCharacterState = useCallback((id: string, stage: number) => {
    setState(currentState => {
      // 1. 기본 상태 업데이트
      const newState = {
        ...currentState,
        speciesId: id,
        evolutionStage: stage
      };

      // 2. 도감 해금 처리 (Unlock Encyclopedia)
      // 해당 종의 1부터 현재 stage까지 모두 해금
      const unlockedMap = newState.unlockedJellos || {};
      const currentUnlocks = unlockedMap[id] || [];
      const newUnlocks = new Set(currentUnlocks);

      for (let i = 1; i <= stage; i++) {
        newUnlocks.add(i);
      }

      newState.unlockedJellos = {
        ...unlockedMap,
        [id]: Array.from(newUnlocks).sort((a, b) => a - b)
      };

      // saveNurturingState(newState); // Handled by throttle
      return newState;
    });
  }, []);

  const setCharacterName = useCallback((name: string) => {
    setState(currentState => {
      const newState = {
        ...currentState,
        characterName: name,
      };
      // saveNurturingState(newState); // Handled by throttle
      return newState;
    });
  }, []);




  // Jello Sleep Toggle
  const toggleSleep = useCallback(() => {
    setState((currentState) => {
      // NOTE: Removed gameDifficulty check - it was blocking sleep even in Pet Room
      // because gameDifficulty persisted from previous game sessions

      const nextIsSleeping = !currentState.isSleeping;

      const newState = {
        ...currentState,
        isSleeping: nextIsSleeping,
        sleepStartTime: nextIsSleeping ? Date.now() : undefined,
      };

      console.log(nextIsSleeping ? '😴 젤로가 잠들었습니다.' : '🌅 젤로가 일어났습니다.');
      // saveNurturingState(newState); // Handled by throttle
      return newState;
    });
  }, []);

  // 가출 상태 UI 정보
  const abandonmentStatus = getAbandonmentStatusUI(state.abandonmentState, Date.now());

  // Context Value
  const value: NurturingContextValue = React.useMemo(() => ({
    stats: state.stats,
    poops: state.poops,
    bugs: state.bugs || [],
    gameScores: state.gameScores,
    categoryProgress: state.categoryProgress,
    condition,
    currentLand: state.currentLand,
    gro: state.gro,
    totalCurrencyEarned: state.totalCurrencyEarned,
    studyCount: state.studyCount,
    isTickActive: state.tickConfig.isActive,
    gameDifficulty: state.gameDifficulty ?? null,
    abandonmentStatus,
    isSick: state.isSick || false,
    xp: state.xp || 0,

    evolutionStage: state.evolutionStage || 1,
    speciesId: state.speciesId, // Expose speciesId
    characterName: state.characterName,
    unlockedJellos: state.unlockedJellos,
    maxStats,
    addRewards,
    feed,
    giveMedicine,
    setCharacterState,
    setCharacterName,
    clean,
    cleanBug,
    cleanAll,
    takeShower,
    brushTeeth,
    play,
    study,
    clickPoop,
    clickBug,
    spendGro,
    purchaseItem,
    equipLand,
    equipHouse,
    inventory: state.inventory || ['default_ground'],
    resetGame,
    pauseTick,
    resumeTick,
    setGameDifficulty,
    hasCharacter: state.hasCharacter ?? false,
    completeCharacterCreation,
    saveToCloud,
    isEvolving,
    completeEvolutionAnimation,
    isGraduating,
    completeGraduationAnimation,
    recordGameScore,

    // Subscription
    subscription,
    purchasePlan,

    // Sleep System
    isSleeping: state.isSleeping || false,
    currentHouseId: state.currentHouseId || 'tent',
    toggleSleep,

    // Global Loading State
    isGlobalLoading,
  }), [
    state.stats,
    state.poops,
    state.bugs,
    state.gro, // Ensure array start is correct
    state.totalCurrencyEarned,
    state.studyCount,
    state.tickConfig.isActive,
    state.gameDifficulty,
    state.inventory,
    state.hasCharacter,
    state.xp,
    state.evolutionStage,
    state.unlockedJellos, // Added dependency
    state.categoryProgress, // Added dependency
    state.gameScores, // CRITICAL: Added for Hybrid Storage v2
    state.isSick, // Added dependency
    state.isSleeping, // Added dependency
    state.currentHouseId, // Added dependency
    condition,
    abandonmentStatus,
    feed,
    giveMedicine,
    clean,
    cleanBug,
    cleanAll,
    takeShower,
    brushTeeth,
    play,
    study,
    clickPoop,
    clickBug,
    spendGro,
    purchaseItem,
    resetGame,
    pauseTick,
    resumeTick,
    setGameDifficulty,
    completeCharacterCreation,
    addRewards,
    saveToCloud,
    isEvolving,
    completeEvolutionAnimation,
    isGraduating,
    completeGraduationAnimation,
    subscription,
    purchasePlan,

    // Global Loading Dependency
    isGlobalLoading,
  ]);

  return <NurturingContext.Provider value={value}>{children}</NurturingContext.Provider>;
};

export default NurturingContext;
