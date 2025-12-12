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
} from '../constants/nurturing';
import {
  loadNurturingState,
  saveNurturingState,
  applyOfflineProgress,
  resetNurturingState,
} from '../services/persistenceService';
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
          console.warn('☁️ Fetch failed:', result.error);
          if (!result.notFound) {
            alert(`Sync Error: ${result.error}\n(Local data will be used)`);
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
              alert(`Cloud Data Loaded!\nGro: ${cloudData.gro}\nXP: ${cloudData.xp}\nInv: ${cloudData.inventory?.length}\nState Inv: ${fullState.inventory?.length}`);
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

  // Cloud Sync: Auto-Save every 5 minutes
  useEffect(() => {
    if (!user) return;

    const AUTO_SAVE_INTERVAL = 15 * 60 * 1000; // 15 minutes
    console.log('☁️ Auto-save timer started');

    const timer = setInterval(() => {
      console.log('☁️ Triggering auto-save...');
      syncUserData(user, state);
    }, AUTO_SAVE_INTERVAL);

    return () => clearInterval(timer);
  }, [user, state]); // Deps: user (active), state (latest data)

  // Cloud Sync: Save on Window Close
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (user) {
        syncUserData(user, state);
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [user, state]);

  // Manual Save Function (Exposed)
  const saveToCloud = useCallback(async () => {
    if (!user) return false;
    console.log('☁️ Manual save requested...');
    return await syncUserData(user, state);
  }, [user, state]);

  // ... existing code ...

  const addRewards = useCallback((xpAmount: number, groAmount: number) => {
    setState((currentState) => {
      const { newXP, newStage, evolved } = addXPAndCheckEvolution(
        currentState.xp || 0,
        (currentState.evolutionStage || 1) as any,
        xpAmount
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

  const feed = useCallback((food: FoodItem): ActionResult => {
    let result: ActionResult & { pendingPoopScheduled?: PendingPoop } = { success: false, statChanges: {} };

    setState((currentState) => {
      result = serviceFeed(currentState.stats, food.id, currentState.poops, currentState.pendingPoops || []);

      if (!result.success) {
        return currentState;
      }

      // 스탯 업데이트
      const newStats: NurturingStats = {
        fullness: clampStat(currentState.stats.fullness + (result.statChanges.fullness || 0)),
        health: clampStat(currentState.stats.health + (result.statChanges.health || 0)),
        happiness: clampStat(currentState.stats.happiness + (result.statChanges.happiness || 0)),
      };

      // 예약된 똥 추가
      let newPendingPoops = currentState.pendingPoops || [];
      if (result.pendingPoopScheduled) {
        newPendingPoops = [...newPendingPoops, result.pendingPoopScheduled];
        console.log('💩 똥 예약됨!', Math.round((result.pendingPoopScheduled.scheduledAt - Date.now()) / 1000), '초 후');
      }

      const newState: NurturingPersistentState = {
        ...currentState,
        stats: newStats,
        pendingPoops: newPendingPoops,
        lastActiveTime: Date.now(),
      };

      saveNurturingState(newState);
      setCondition(evaluateCondition(newStats, currentState.isSick)); // 질병 상태 유지

      return newState;
    });

    return result;
  }, []);

  const giveMedicine = useCallback((medicine: MedicineItem): ActionResult => {
    let result: ActionResult & { cureProgressDelta?: number } = { success: false, statChanges: {} };

    setState((currentState) => {
      // 질병 상태 전달
      result = serviceGiveMedicine(currentState.stats, medicine.id, currentState.isSick);

      if (!result.success) {
        return currentState;
      }

      const newStats: NurturingStats = {
        fullness: currentState.stats.fullness,
        health: clampStat(currentState.stats.health + (result.statChanges.health || 0)),
        happiness: clampStat(currentState.stats.happiness + (result.statChanges.happiness || 0)),
      };

      // 질병 치료 진행도 업데이트
      let newIsSick = currentState.isSick;
      let newSickProgress = currentState.sickProgress || 0;

      if (result.cureProgressDelta && result.cureProgressDelta > 0) {
        newSickProgress += result.cureProgressDelta;

        // 치료 완료 체크 (2포인트 이상이면 완치)
        if (newSickProgress >= 2) {
          newIsSick = false;
          newSickProgress = 0;
          console.log('💊 질병이 완치되었습니다!');
        } else {
          console.log(`💊 치료 진행 중... (${newSickProgress}/2)`);
        }
      }

      const newState: NurturingPersistentState = {
        ...currentState,
        stats: newStats,
        isSick: newIsSick, // 상태 업데이트
        sickProgress: newSickProgress, // 진행도 업데이트
        lastActiveTime: Date.now(),
      };

      saveNurturingState(newState);
      setCondition(evaluateCondition(newStats, newIsSick));

      return newState;
    });

    return result;
  }, []);

  const clean = useCallback((_tool: CleaningTool): ActionResult => {
    let result: ActionResult = { success: false, statChanges: {} };

    setState((currentState) => {
      // serviceClean signature: (stats, poops)
      // Note: We are ignoring tool.id for now as the service doesn't support it yet.
      // If tool specific logic is needed, actionService.ts needs to be updated first.
      result = serviceClean(currentState.stats, currentState.poops);

      const newStats: NurturingStats = {
        fullness: currentState.stats.fullness,
        health: clampStat(currentState.stats.health + (result.statChanges.health || 0)),
        happiness: clampStat(currentState.stats.happiness + (result.statChanges.happiness || 0)),
      };

      const newState: NurturingPersistentState = {
        ...currentState,
        stats: newStats,
        poops: [], // 모든 똥 제거
        lastActiveTime: Date.now(),
      };

      saveNurturingState(newState);
      setCondition(evaluateCondition(newStats));

      return newState;
    });

    return result;
  }, []);

  const play = useCallback((): ActionResult => {
    let result: ActionResult = { success: false, statChanges: {} };

    setState((currentState) => {
      result = servicePlay(currentState.stats);

      const newStats: NurturingStats = {
        fullness: clampStat(currentState.stats.fullness + (result.statChanges.fullness || 0)),
        health: currentState.stats.health,
        happiness: clampStat(currentState.stats.happiness + (result.statChanges.happiness || 0)),
      };

      const newState: NurturingPersistentState = {
        ...currentState,
        stats: newStats,
        lastActiveTime: Date.now(),
      };

      saveNurturingState(newState);
      setCondition(evaluateCondition(newStats));

      return newState;
    });

    return result;
  }, []);

  const study = useCallback((): ActionResult => {
    let result: ActionResult = { success: false, statChanges: {} };

    setState((currentState) => {
      result = serviceStudy(currentState.stats);

      if (!result.success) {
        return currentState;
      }

      const newStats: NurturingStats = {
        fullness: clampStat(currentState.stats.fullness + (result.statChanges.fullness || 0)),
        health: currentState.stats.health,
        happiness: clampStat(currentState.stats.happiness + (result.statChanges.happiness || 0)),
      };

      const currencyEarned = result.sideEffects?.currencyEarned || 0;
      const newState: NurturingPersistentState = {
        ...currentState,
        stats: newStats,
        gro: (currentState.gro || 0) + currencyEarned,
        totalCurrencyEarned: currentState.totalCurrencyEarned + currencyEarned,
        studyCount: currentState.studyCount + 1,
        lastActiveTime: Date.now(),
      };

      saveNurturingState(newState);
      setCondition(evaluateCondition(newStats));

      return newState;
    });

    return result;
  }, []);

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
    setState((currentState) => {
      const newStats: NurturingStats = {
        fullness: 100,
        health: 100,
        happiness: 100,
      };

      const newState: NurturingPersistentState = {
        ...currentState,
        stats: newStats,
        isSick: false,
        sickProgress: 0,
        lastActiveTime: Date.now(),
      };
      saveNurturingState(newState);
      setCondition(evaluateCondition(newStats));
      return newState;
    });

    return {
      success: true,
      statChanges: { fullness: 100, health: 100, happiness: 100 },
      message: '모든 상태가 회복되었습니다!',
    };
  }, []);

  const takeShower = useCallback((): ActionResult => {
    let result: ActionResult = { success: false, statChanges: {} };

    setState((currentState) => {
      result = serviceTakeShower(currentState.stats);

      if (!result.success) {
        return currentState;
      }

      const newStats: NurturingStats = {
        ...currentState.stats,
        health: clampStat(currentState.stats.health + (result.statChanges.health || 0)),
        happiness: clampStat(currentState.stats.happiness + (result.statChanges.happiness || 0)),
      };

      const newState: NurturingPersistentState = {
        ...currentState,
        stats: newStats,
        lastActiveTime: Date.now(),
      };

      saveNurturingState(newState);
      setCondition(evaluateCondition(newStats));

      return newState;
    });

    return result;
  }, []);

  const brushTeeth = useCallback((): ActionResult => {
    let result: ActionResult = { success: false, statChanges: {} };

    setState((currentState) => {
      result = serviceBrushTeeth(currentState.stats);

      if (!result.success) {
        return currentState;
      }

      const newStats: NurturingStats = {
        ...currentState.stats,
        health: clampStat(currentState.stats.health + (result.statChanges.health || 0)),
        happiness: clampStat(currentState.stats.happiness + (result.statChanges.happiness || 0)),
      };

      const newState: NurturingPersistentState = {
        ...currentState,
        stats: newStats,
        lastActiveTime: Date.now(),
      };

      saveNurturingState(newState);
      setCondition(evaluateCondition(newStats));

      return newState;
    });

    return result;
  }, []);

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
    const newState = resetNurturingState();
    setState({
      ...newState,
      hasCharacter: false, // Reset character state
      gameDifficulty: null, // Reset game difficulty
    });
    setCondition(evaluateCondition(newState.stats));
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
    maxStats,
    addRewards,
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
