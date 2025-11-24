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
import { TICK_INTERVAL_MS, BUG_CONFIG } from '../constants/nurturing';
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
  calculateBugSpawnChance,
  createBug,
} from '../services/gameTickService';
import {
  feedCharacter as serviceFeed,
  giveMedicine as serviceGiveMedicine,
  cleanRoom as serviceCleanRoom,
  playWithCharacter as servicePlay,
  studyWithCharacter as serviceStudy,
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
  totalCurrencyEarned: number;
  studyCount: number;
  isTickActive: boolean;
  abandonmentStatus: AbandonmentStatusUI;  // 가출 상태

  // 행동 (Actions)
  feed: (foodId: string) => ActionResult;
  giveMedicine: (medicineId: string) => ActionResult;
  clean: () => ActionResult;
  cleanBug: () => ActionResult;
  play: () => ActionResult;
  study: () => ActionResult;
  clickPoop: (poopId: string) => void;
  clickBug: (bugId: string) => void;

  // 유틸리티
  resetGame: () => void;
  pauseTick: () => void;
  resumeTick: () => void;
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
      const tickResult = executeGameTick(currentState.stats, currentState.poops, currentState.bugs || []);

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

      // 벌레 생성 시도
      let newBugs = [...(currentState.bugs || [])];
      if (newBugs.length < BUG_CONFIG.MAX_BUGS) {
        const spawnChance = calculateBugSpawnChance(newPoops);
        if (Math.random() < spawnChance) {
          const newBug = createBug();
          newBugs.push(newBug);
          console.log(`🦟 벌레가 나타났어요! (${newBug.type})`);
        }
      }

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
        bugs: newBugs,
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
        console.log('[Game Tick]', tickResult.alerts.join(', '));
      }

      return newState;
    });
  }, []);

  // 게임 틱 시작
  useEffect(() => {
    if (!state.tickConfig.isActive) {
      return;
    }

    // 초기 틱
    runGameTick();

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

  const feed = useCallback((foodId: string): ActionResult => {
    let result: ActionResult & { pendingPoopScheduled?: PendingPoop } = { success: false, statChanges: {} };

    setState((currentState) => {
      result = serviceFeed(currentState.stats, foodId, currentState.poops, currentState.pendingPoops || []);

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

  const giveMedicine = useCallback((medicineId: string): ActionResult => {
    let result: ActionResult = { success: false, statChanges: {} };

    setState((currentState) => {
      result = serviceGiveMedicine(currentState.stats, medicineId);

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

  const clean = useCallback((): ActionResult => {
    let result: ActionResult = { success: false, statChanges: {} };

    setState((currentState) => {
      result = serviceCleanRoom(currentState.stats, currentState.poops);

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

      const newState: NurturingPersistentState = {
        ...currentState,
        stats: newStats,
        totalCurrencyEarned: currentState.totalCurrencyEarned + (result.sideEffects?.currencyEarned || 0),
        studyCount: currentState.studyCount + 1,
        lastActiveTime: Date.now(),
      };

      saveNurturingState(newState);
      setCondition(evaluateCondition(newStats));

      return newState;
    });

    return result;
  }, []);

  const clickPoop = useCallback((poopId: string) => {
    setState((currentState) => {
      const { updatedPoops, removed } = removePoop(poopId, currentState.poops);

      if (!removed) {
        return currentState;
      }

      const newState: NurturingPersistentState = {
        ...currentState,
        poops: updatedPoops,
      };

      saveNurturingState(newState);

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

      const newState: NurturingPersistentState = {
        ...currentState,
        bugs: updatedBugs,
        lastActiveTime: Date.now(),
      };

      saveNurturingState(newState);

      result = { success: true, statChanges: {}, message: '벌레 1마리를 제거했습니다!' };

      return newState;
    });

    return result;
  }, []);

  const resetGame = useCallback(() => {
    const newState = resetNurturingState();
    setState(newState);
    setCondition(evaluateCondition(newState.stats));
  }, []);

  const pauseTick = useCallback(() => {
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

  // 가출 상태 UI 정보
  const abandonmentStatus = getAbandonmentStatusUI(state.abandonmentState, Date.now());

  // Context Value
  const value: NurturingContextValue = {
    stats: state.stats,
    poops: state.poops,
    bugs: state.bugs || [],
    condition,
    totalCurrencyEarned: state.totalCurrencyEarned,
    studyCount: state.studyCount,
    isTickActive: state.tickConfig.isActive,
    abandonmentStatus,
    feed,
    giveMedicine,
    clean,
    cleanBug,
    play,
    study,
    clickPoop,
    clickBug,
    resetGame,
    pauseTick,
    resumeTick,
  };

  return <NurturingContext.Provider value={value}>{children}</NurturingContext.Provider>;
};

export default NurturingContext;
