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
import type { Poop } from '../types/nurturing';

interface NurturingContextValue {
  // 상태
  stats: NurturingStats;
  poops: Poop[];
  bugs: Bug[];
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
  addRewards: (xp: number, gro: number) => void;

  // 행동 (Actions)
  feed: (food: FoodItem) => ActionResult;
  giveMedicine: (medicine: MedicineItem) => ActionResult;
  clean: (tool: CleaningTool) => ActionResult;
  cleanBug: () => ActionResult;
  cleanAll: () => ActionResult;
  takeShower: () => ActionResult;
  brushTeeth: () => ActionResult;
  play: () => ActionResult;
  study: () => ActionResult;
  clickPoop: (poopId: string, happinessBonus?: number) => void;
  clickBug: (bugId: string) => void;
  spendGro: (amount: number) => boolean;
  purchaseItem: (itemId: string, price: number) => boolean;
  equipLand: (landId: string) => boolean;
  inventory: string[];

  // 유틸리티
  resetGame: () => void;
  pauseTick: () => void;
  resumeTick: () => void;
  setGameDifficulty: (difficulty: number | null) => void;
  hasCharacter: boolean;
  completeCharacterCreation: () => void;
  saveToCloud: () => Promise<boolean>;
  setSpeciesId: (id: string) => void;
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
import { syncUserData, fetchUserData } from '../services/syncService';

// ... existing imports ...

export const NurturingProvider: React.FC<NurturingProviderProps> = ({ children }) => {
  const { user } = useAuth(); // Import user from AuthContext

  // 상태
  const [state, setState] = useState<NurturingPersistentState>(() => {
    // ... existing init ...
    const loaded = loadNurturingState();
    const { updatedState } = applyOfflineProgress(loaded);
    saveNurturingState(updatedState);
    return updatedState;
  });

  // ... existing code ...

  // Cloud Sync: Fetch on Login
  useEffect(() => {
    if (user) {
      console.log('☁️ Fetching cloud data for user:', user.uid);
      console.log('☁️ Fetching cloud data for user:', user.uid);
      fetchUserData(user).then((result) => {
        if (!result.success) {
          if (result.notFound) {
            console.log('☁️ New user detected (no cloud data). Resetting local state.');
            const newState = resetNurturingState();
            setState(newState);
          } else {
            console.warn('☁️ Fetch failed:', result.error);
          }
          return;
        }

        const cloudData = result.data;
        if (cloudData) {
          console.log('☁️ Cloud data found, syncing...', cloudData);
          setState((prev) => {
            // If full game state exists, use it. Otherwise, merge core stats.
            let fullState = cloudData.gameData || cloudData.game_data;

            // Handle if D1 returned string and backend didn't parse (robustness)
            if (typeof fullState === 'string') {
              try {
                fullState = JSON.parse(fullState);
              } catch (e) {
                console.error('Failed to parse game_data string:', e);
              }
            }

            let newState: NurturingPersistentState;

            if (fullState && typeof fullState === 'object') {
              console.log('📦 Restoring full game state from cloud', fullState);
              newState = {
                ...prev,
                ...fullState,
                // Ensure core tracking fields are synced from columns as well (Double Check)
                gro: cloudData.gro ?? fullState.gro,
                xp: cloudData.xp ?? fullState.xp,
                evolutionStage: cloudData.level ?? fullState.evolutionStage,
                inventory: cloudData.inventory ?? fullState.inventory,
                currentLand: cloudData.current_land || fullState.currentLand || 'default_ground',
                // Explicitly ensure hasCharacter is restored
                hasCharacter: fullState.hasCharacter ?? prev.hasCharacter,
              };
            } else {
              console.log('⚠️ No full state found, syncing core stats only');
              newState = {
                ...prev,
                evolutionStage: cloudData.level,
                xp: cloudData.xp,
                gro: cloudData.gro,
                currentLand: cloudData.current_land || 'default_ground',
                inventory: cloudData.inventory,
              };
            }

            saveNurturingState(newState);
            return newState;
          });
        }
      });
    }
  }, [user]);

  // Keep state ref for event handlers (if needed for timer)
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
      console.log('☁️ Triggering auto-save...');
      // Use ref to avoid resetting timer on state change
      if (stateRef.current) {
        syncUserData(user, stateRef.current);
      }
    }, AUTO_SAVE_INTERVAL);

    return () => clearInterval(timer);
  }, [user]); // Only restart if User changes. State is accessed via Ref.

  // Manual Save Function (Exposed)
  const saveToCloud = useCallback(async () => {
    if (!user) return false;
    console.log('☁️ Manual save requested...');
    return await syncUserData(user, state);
  }, [user, state]);

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

      const { newXP, newStage, evolved } = addXPAndCheckEvolution(
        currentState.xp || 0,
        (currentState.evolutionStage || 1) as any,
        xpAmount,
        currentState.history,
        conditions
      );

      const newState = {
        ...currentState,
        xp: newXP,
        evolutionStage: newStage,
        gro: (currentState.gro || 0) + groAmount,
        totalCurrencyEarned: (currentState.totalCurrencyEarned || 0) + groAmount,
      };

      if (evolved) {
        console.log(`🎉 EVOLUTION! Stage ${newStage}`);
        // TODO: Trigger visual celebration
      }

      saveNurturingState(newState);
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
      saveNurturingState(newState);
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
      saveNurturingState(newState);
      return newState;
    });
    return success;
  }, []);

  const [condition, setCondition] = useState<CharacterCondition>(() =>
    evaluateCondition(state.stats)
  );

  const tickIntervalRef = useRef<number | null>(null);

  // 게임 틱 실행
  const runGameTick = useCallback(() => {
    setState((currentState) => {
      // 3. 게임 틱 실행
      const tickResult = executeGameTick(
        currentState.stats,
        currentState.poops,
        currentState.bugs || [],
        currentState.gameDifficulty ?? null,
        currentState.isSick // 현재 질병 상태 전달
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
        tickConfig: {
          ...currentState.tickConfig,
          lastTickTime: Date.now(),
        },
      };

      // 저장
      saveNurturingState(newState);

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
    if (!state.tickConfig.isActive) {
      return;
    }

    // 초기 틱 (제거: 일시정지 해제 시 즉시 감소 방지)
    // runGameTick();
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
  }, [state.tickConfig.isActive, runGameTick]);

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
      saveNurturingState(newState);
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
      (result, currentState) => {
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
      (result, currentState) => {
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
      saveNurturingState(newState);
      return newState;
    });
    return success;
  }, []);

  const cleanAll = useCallback((): ActionResult => {
    setState((currentState) => {
      const newStats: NurturingStats = {
        ...currentState.stats,
        happiness: clampStat(currentState.stats.happiness + 10),
      };

      const newState: NurturingPersistentState = {
        ...currentState,
        stats: newStats,
        poops: [],
        bugs: [],
        lastActiveTime: Date.now(),
      };
      saveNurturingState(newState);
      setCondition(evaluateCondition(newStats));
      return newState;
    });

    return {
      success: true,
      statChanges: {},
      message: '모든 오염물을 청소했습니다!',
    };
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
      saveNurturingState(newState);
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
      };

      const newState: NurturingPersistentState = {
        ...currentState,
        stats: newStats,
        poops: updatedPoops,
      };

      saveNurturingState(newState);
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

      const newState: NurturingPersistentState = {
        ...currentState,
        bugs: updatedBugs,
      };

      saveNurturingState(newState);

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
      };

      const newState: NurturingPersistentState = {
        ...currentState,
        stats: newStats,
        bugs: updatedBugs,
        lastActiveTime: Date.now(),
      };

      saveNurturingState(newState);
      setCondition(evaluateCondition(newStats));

      result = { success: true, statChanges: { happiness: 3 }, message: '벌레 1마리를 제거했습니다!' };

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

      saveNurturingState(preservedState);
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
      saveNurturingState(newState);
      return newState;
    });
  }, []);

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
      saveNurturingState(newState);
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
      saveNurturingState(newState);
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
      saveNurturingState(newState); // Save the state change
      return newState;
    });
  }, []);

  const setSpeciesId = useCallback((id: string) => {
    setState(currentState => {
      const newState = { ...currentState, speciesId: id };
      saveNurturingState(newState);
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
    maxStats,
    addRewards,
    feed,
    giveMedicine,
    setSpeciesId,
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
    inventory: state.inventory || ['default_ground'],
    resetGame,
    pauseTick,
    resumeTick,
    setGameDifficulty,
    hasCharacter: state.hasCharacter ?? false,
    completeCharacterCreation,
    saveToCloud, // Expose new function
  }), [
    state.stats,
    state.poops,
    state.bugs,
    state.gro,
    state.totalCurrencyEarned,
    state.studyCount,
    state.tickConfig.isActive,
    state.gameDifficulty,
    state.inventory,
    state.hasCharacter,
    state.xp,
    state.evolutionStage,
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
    addRewards
  ]);

  return <NurturingContext.Provider value={value}>{children}</NurturingContext.Provider>;
};

export default NurturingContext;
