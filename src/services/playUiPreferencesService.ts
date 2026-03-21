import type { GameCategory } from '../games/types';

export type PlayLearnMode = 'play' | 'learn';
export type PlayMathMode = 'adventure' | 'genius';
export type PlayOperator = 'ADD' | 'SUB' | 'MUL' | 'DIV';

export interface PlayUiPreferences {
  playLearnMode: PlayLearnMode;
  activeTab: GameCategory;
  mathMode: PlayMathMode;
  selectedOp: PlayOperator;
}

const STORAGE_KEY_PREFIX = 'puzzleletic_play_ui_v1';

const DEFAULT_PLAY_UI_PREFERENCES: PlayUiPreferences = {
  playLearnMode: 'learn',
  activeTab: 'math',
  mathMode: 'adventure',
  selectedOp: 'ADD',
};

const GAME_CATEGORIES: GameCategory[] = ['brain', 'math', 'science', 'sw'];
const PLAY_LEARN_MODES: PlayLearnMode[] = ['play', 'learn'];
const PLAY_MATH_MODES: PlayMathMode[] = ['adventure', 'genius'];
const PLAY_OPERATORS: PlayOperator[] = ['ADD', 'SUB', 'MUL', 'DIV'];

export const getPlayUiPreferencesKey = (scopeId?: string) => {
  return scopeId ? `${STORAGE_KEY_PREFIX}_${scopeId}` : STORAGE_KEY_PREFIX;
};

export const getDefaultPlayUiPreferences = (): PlayUiPreferences => ({
  ...DEFAULT_PLAY_UI_PREFERENCES,
});

export const loadPlayUiPreferences = (scopeId?: string): PlayUiPreferences => {
  try {
    const serialized = localStorage.getItem(getPlayUiPreferencesKey(scopeId));
    if (!serialized) return getDefaultPlayUiPreferences();

    const parsed = JSON.parse(serialized) as Partial<PlayUiPreferences>;

    return {
      playLearnMode: PLAY_LEARN_MODES.includes(parsed.playLearnMode as PlayLearnMode)
        ? (parsed.playLearnMode as PlayLearnMode)
        : DEFAULT_PLAY_UI_PREFERENCES.playLearnMode,
      activeTab: GAME_CATEGORIES.includes(parsed.activeTab as GameCategory)
        ? (parsed.activeTab as GameCategory)
        : DEFAULT_PLAY_UI_PREFERENCES.activeTab,
      mathMode: PLAY_MATH_MODES.includes(parsed.mathMode as PlayMathMode)
        ? (parsed.mathMode as PlayMathMode)
        : DEFAULT_PLAY_UI_PREFERENCES.mathMode,
      selectedOp: PLAY_OPERATORS.includes(parsed.selectedOp as PlayOperator)
        ? (parsed.selectedOp as PlayOperator)
        : DEFAULT_PLAY_UI_PREFERENCES.selectedOp,
    };
  } catch (error) {
    console.warn('[PlayUI] Failed to load preferences:', error);
    return getDefaultPlayUiPreferences();
  }
};

export const savePlayUiPreferences = (
  scopeId: string | undefined,
  preferences: PlayUiPreferences
): void => {
  try {
    localStorage.setItem(
      getPlayUiPreferencesKey(scopeId),
      JSON.stringify(preferences)
    );
  } catch (error) {
    console.warn('[PlayUI] Failed to save preferences:', error);
  }
};
