import { useCallback, useEffect, useState } from 'react';
import type { DailyRoutineProgressPayload, DailyRoutineState } from '../../types/dailyRoutine';
import {
  applyDailyRoutineProgress,
  getOrCreateDailyRoutineState,
  markDailyRoutineClaimed,
  refreshDailyRoutineStateForToday,
  saveDailyRoutineState,
} from '../../services/dailyRoutineService';

export const useDailyRoutine = (scopeId?: string) => {
  const [dailyRoutine, setDailyRoutine] = useState<DailyRoutineState>(() =>
    getOrCreateDailyRoutineState(scopeId),
  );

  useEffect(() => {
    setDailyRoutine(getOrCreateDailyRoutineState(scopeId));
  }, [scopeId]);

  useEffect(() => {
    saveDailyRoutineState(dailyRoutine, scopeId);
  }, [dailyRoutine, scopeId]);

  const refreshForToday = useCallback(() => {
    setDailyRoutine((currentState) => {
      const refreshedState = refreshDailyRoutineStateForToday(currentState);

      if (refreshedState !== currentState) {
        saveDailyRoutineState(refreshedState, scopeId);
      }

      return refreshedState;
    });
  }, [scopeId]);

  const incrementTask = useCallback((payload: DailyRoutineProgressPayload) => {
    setDailyRoutine((currentState) => {
      const refreshedState = refreshDailyRoutineStateForToday(currentState);
      const nextState = applyDailyRoutineProgress(refreshedState, payload);

      if (nextState !== currentState) {
        saveDailyRoutineState(nextState, scopeId);
      }

      return nextState;
    });
  }, [scopeId]);

  const markClaimed = useCallback(() => {
    setDailyRoutine((currentState) => {
      const nextState = markDailyRoutineClaimed(currentState);
      saveDailyRoutineState(nextState, scopeId);
      return nextState;
    });
  }, [scopeId]);

  return {
    dailyRoutine,
    setDailyRoutine,
    refreshForToday,
    incrementTask,
    markClaimed,
  };
};
