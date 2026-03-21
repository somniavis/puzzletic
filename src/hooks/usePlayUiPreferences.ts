import { useEffect, useMemo, useState } from 'react';
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
  const initialPreferences = useMemo(
    () => loadPlayUiPreferences(scopeId),
    [scopeId]
  );

  const [playLearnMode, setPlayLearnMode] = useState<PlayLearnMode>(initialPreferences.playLearnMode);
  const [activeTab, setActiveTab] = useState<GameCategory>(initialPreferences.activeTab);
  const [mathMode, setMathMode] = useState<PlayMathMode>(initialPreferences.mathMode);
  const [selectedOp, setSelectedOp] = useState<PlayOperator>(initialPreferences.selectedOp);

  useEffect(() => {
    const nextPreferences = loadPlayUiPreferences(scopeId);
    setPlayLearnMode(nextPreferences.playLearnMode);
    setActiveTab(nextPreferences.activeTab);
    setMathMode(nextPreferences.mathMode);
    setSelectedOp(nextPreferences.selectedOp);
  }, [scopeId]);

  useEffect(() => {
    if (!scopeId) return;
    savePlayUiPreferences(scopeId, {
      playLearnMode,
      activeTab,
      mathMode,
      selectedOp,
    });
  }, [scopeId, playLearnMode, activeTab, mathMode, selectedOp]);

  const resetPlayUiPreferences = () => {
    const defaults = getDefaultPlayUiPreferences();
    setPlayLearnMode(defaults.playLearnMode);
    setActiveTab(defaults.activeTab);
    setMathMode(defaults.mathMode);
    setSelectedOp(defaults.selectedOp);
  };

  return {
    playLearnMode,
    setPlayLearnMode,
    activeTab,
    setActiveTab,
    mathMode,
    setMathMode,
    selectedOp,
    setSelectedOp,
    resetPlayUiPreferences,
  };
};
