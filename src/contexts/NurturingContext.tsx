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
import { POOP_CONFIG } from '../constants/nurturing';
import type { Poop } from '../types/nurturing';

interface NurturingContextValue {
  // 상태
  stats: NurturingStats;
  poops: Poop[];
  bugs: Bug[];
  condition: CharacterCondition;
  glo: number;
  totalCurrencyEarned: number;
  studyCount: number;
  isTickActive: boolean;
  gameDifficulty: number | null; // 게임 난이도 (null이면 게임 중 아님)
  abandonmentStatus: AbandonmentStatusUI;  // 가출 상태

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
  spendGlo: (amount: number) => boolean;
  purchaseItem: (itemId: string, price: number) => boolean;
  inventory: string[];

  // 유틸리티
  resetGame: () => void;
  pauseTick: () => void;
  resumeTick: () => void;
  setGameDifficulty: (difficulty: number | null) => void;
  hasCharacter: boolean;
  completeCharacterCreation: () => void;
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

export const NurturingProvider: React.FC<NurturingProviderProps> = ({ children }) => {
  // 상태
  const [state, setState] = useState<NurturingPersistentState>(() => {
    const loaded = loadNurturingState();
    const { updatedState } = applyOfflineProgress(loaded);
    saveNurturingState(updatedState);
    return updatedState;
  });

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
        currentState.gameDifficulty ?? null
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
      setCondition(evaluateCondition(newStats));

      return newState;
    });

    return result;
  }, []);

  const giveMedicine = useCallback((medicine: MedicineItem): ActionResult => {
    let result: ActionResult = { success: false, statChanges: {} };

    setState((currentState) => {
      result = serviceGiveMedicine(currentState.stats, medicine.id);

      if (!result.success) {
        return currentState;
      }

      const newStats: NurturingStats = {
        fullness: currentState.stats.fullness,
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
        glo: (currentState.glo || 0) + currencyEarned,
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

  const spendGlo = useCallback((amount: number): boolean => {
    let success = false;
    setState((currentState) => {
      if ((currentState.glo || 0) < amount) {
        success = false;
        return currentState;
      }

      success = true;
      const newState = {
        ...currentState,
        glo: (currentState.glo || 0) - amount,
      };
      saveNurturingState(newState);
      return newState;
    });
    return success;
  }, []);

  const purchaseItem = useCallback((itemId: string, price: number): boolean => {
    let success = false;
    setState((currentState) => {
      // 이미 보유 중이면 성공 처리 (돈 차감 안 함)
      if (currentState.inventory?.includes(itemId)) {
        success = true;
        return currentState;
      }

      // 돈 부족
      if ((currentState.glo || 0) < price) {
        success = false;
        return currentState;
      }

      success = true;
      const newState = {
        ...currentState,
        glo: (currentState.glo || 0) - price,
        inventory: [...(currentState.inventory || []), itemId],
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
    glo: state.glo,
    totalCurrencyEarned: state.totalCurrencyEarned,
    studyCount: state.studyCount,
    isTickActive: state.tickConfig.isActive,
    gameDifficulty: state.gameDifficulty ?? null,
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
    spendGlo,
    purchaseItem,
    inventory: state.inventory || ['default_ground'],
    resetGame,
    pauseTick,
    resumeTick,
    setGameDifficulty,
    hasCharacter: state.hasCharacter ?? false,
    completeCharacterCreation,
  }), [
    state.stats,
    state.poops,
    state.bugs,
    state.glo,
    state.totalCurrencyEarned,
    state.studyCount,
    state.tickConfig.isActive,
    state.gameDifficulty,
    state.inventory,
    state.hasCharacter,
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
    spendGlo,
    purchaseItem,
    resetGame,
    pauseTick,
    resumeTick,
    setGameDifficulty,
    completeCharacterCreation
  ]);

  return <NurturingContext.Provider value={value}>{children}</NurturingContext.Provider>;
};

export default NurturingContext;
