import { useCallback, useEffect, useState } from 'react';
import type { GameCategory } from '../games/types';
import {
  getDefaultPlayUiPreferences,
  loadPlayUiPreferences,
  savePlayUiPreferences,
  type PlayLearnMode,
  type PlayMathMode,
  type PlayOperator,
} from '../services/playUiPreferencesService';

export const usePlayUiPreferences = (scopeId?: string) => {
  const [preferences, setPreferences] = useState(() => loadPlayUiPreferences(scopeId));

  useEffect(() => {
    setPreferences(loadPlayUiPreferences(scopeId));
  }, [scopeId]);

  useEffect(() => {
    if (!scopeId) return;
    savePlayUiPreferences(scopeId, preferences);
  }, [scopeId, preferences]);

  const setPlayLearnMode = useCallback((playLearnMode: PlayLearnMode) => {
    setPreferences((prev) => ({ ...prev, playLearnMode }));
  }, []);

  const setActiveTab = useCallback((activeTab: GameCategory) => {
    setPreferences((prev) => ({ ...prev, activeTab }));
  }, []);

  const setMathMode = useCallback((mathMode: PlayMathMode) => {
    setPreferences((prev) => ({ ...prev, mathMode }));
  }, []);

  const setSelectedOp = useCallback((selectedOp: PlayOperator) => {
    setPreferences((prev) => ({ ...prev, selectedOp }));
  }, []);

  const resetPlayUiPreferences = useCallback(() => {
    const defaults = getDefaultPlayUiPreferences();
    setPreferences(defaults);
  }, []);

  return {
    playLearnMode: preferences.playLearnMode,
    setPlayLearnMode,
    activeTab: preferences.activeTab,
    setActiveTab,
    mathMode: preferences.mathMode,
    setMathMode,
    selectedOp: preferences.selectedOp,
    setSelectedOp,
    resetPlayUiPreferences,
  };
};
