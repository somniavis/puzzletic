/**
 * Nurturing Context
 * 양육 시스템 전역 상태 관리
 * 
 * Refactored to use custom hooks.
 */

import React, { createContext, useContext, useState, useCallback } from 'react';
import type {
  NurturingStats,
  ActionResult,
  CharacterCondition,
  Poop,
  Bug,
  AbandonmentStatusUI,
  GameScoreValue,
} from '../types/nurturing';
import type { FoodItem } from '../types/food';
import type { MedicineItem } from '../types/medicine';
import type { CleaningTool } from '../types/cleaning';

import { useAuth } from './AuthContext';
import { evaluateCondition } from '../services/gameTickService';
import { getAbandonmentStatusUI } from '../services/gameTickService';

import { updateCategoryProgress, parseGameScore, createGameScore, getUnlockThreshold, getProgressionCategory, getDynamicGameOrder } from '../utils/progression';
import { GAMES } from '../games/registry';

import { saveNurturingState, resetNurturingState } from '../services/persistenceService';
import { syncUserData } from '../services/syncService';

// Hooks
import { useNurturingSync } from './hooks/useNurturingSync';
import type { SubscriptionState } from './hooks/useNurturingSync';
import { useNurturingTick } from './hooks/useNurturingTick';
import { useNurturingActions } from './hooks/useNurturingActions';
import { useEvolutionLogic } from './hooks/useEvolutionLogic';
import type { EvolutionPhase } from '../services/evolutionService';

interface NurturingContextValue {
  // 상태
  stats: NurturingStats;
  poops: Poop[];
  bugs: Bug[];
  gameScores?: Record<string, GameScoreValue>;
  categoryProgress?: Record<string, string>;
  totalGameStars: number;
  condition: CharacterCondition;
  gro: number;
  currentLand: string;
  totalCurrencyEarned: number;
  studyCount: number;
  isTickActive: boolean;
  gameDifficulty: number | null;
  abandonmentStatus: AbandonmentStatusUI;
  isSick: boolean;
  maxStats: () => ActionResult;
  xp: number;
  evolutionStage: number;
  speciesId?: string;
  characterName?: string;
  unlockedJellos?: Record<string, number[]>;
  setCharacterState: (id: string, stage: number) => void;
  setCharacterName: (name: string) => void;
  addRewards: (xp: number, gro: number) => void;

  // UX Logic
  lastPlayedGameId?: string;
  setLastPlayedGameId: (id: string) => void;

  // 행동 (Actions)
  feed: (food: FoodItem) => ActionResult;
  giveMedicine: (medicine: MedicineItem) => ActionResult;
  clean: (tool: CleaningTool) => ActionResult;
  cleanBug: () => ActionResult;
  cleanAll: (cost?: number) => ActionResult;
  takeShower: () => ActionResult;
  brushTeeth: () => ActionResult;
  play: () => ActionResult;
  petCharacter: (happinessChange: number, affectionChange?: number) => void;
  study: () => ActionResult;
  clickPoop: (poopId: string, happinessBonus?: number) => void;
  clickBug: (bugId: string) => void;
  spendGro: (amount: number) => boolean;
  purchaseItem: (itemId: string, price: number) => boolean;
  equipLand: (landId: string) => boolean;
  equipHouse: (houseId: string) => boolean;
  purchaseRandomPet: () => { success: boolean; petId?: string; message?: string };
  currentPetId?: string;
  petExpiresAt?: number;
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
  isGraduating: boolean;
  completeGraduationAnimation: (name: string) => void;

  // Evolution Choice
  // Evolution Control
  evolutionPhase: EvolutionPhase;
  triggerEvolution: () => void;
  triggerGraduation: () => void;
  showSignupModal: boolean;
  setShowSignupModal: (show: boolean) => void;

  // Stats
  recordGameScore: (gameId: string, score: number, incrementPlayCount?: boolean, starsEarned?: number) => void;

  // Subscription
  subscription: SubscriptionState;
  purchasePlan: (planId: '3_months' | '12_months') => Promise<boolean>;
  cancelSubscription: () => Promise<boolean>; // [NEW]

  // Jello House & Sleep
  isSleeping: boolean;
  currentHouseId: string;
  toggleSleep: () => void;

  // Global Loading State
  isGlobalLoading: boolean;

  // Debug
  debugUnlockAllGames: () => void;
  debugAddStars: (amount: number) => void;
}

const NurturingContext = createContext<NurturingContextValue | undefined>(undefined);

export const useNurturing = () => {
  const context = useContext(NurturingContext);
  if (!context) {
    throw new Error('useNurturing must be used within NurturingProvider');
  }
  return context;
};

export const useOptionalNurturing = () => useContext(NurturingContext);

interface NurturingProviderProps {
  children: React.ReactNode;
}

export const NurturingProvider: React.FC<NurturingProviderProps> = ({ children }) => {
  const { user, guestId, isGuest } = useAuth();



  // 1. Sync & State Management
  const {
    state,
    setState,
    isGlobalLoading,
    subscription,
    saveToCloud,
    purchasePlan,
    cancelSubscription,
    stateRef,
    completeCharacterCreation
  } = useNurturingSync(user, guestId);

  // Lazy Expiry Check for Pet (Reactive)
  React.useEffect(() => {
    if (state.currentPetId && state.petExpiresAt) {
      if (Date.now() > state.petExpiresAt) {
        console.log(`⌛ Pet ${state.currentPetId} has expired. Saying goodbye...`);
        setState(prev => {
          // Double check inside setter to be safe
          if (prev.petExpiresAt && Date.now() > prev.petExpiresAt) {
            const newState = { ...prev, currentPetId: undefined, petExpiresAt: undefined };
            saveNurturingState(newState, user?.uid);
            return newState;
          }
          return prev;
        });
      }
    }
  }, [state.currentPetId, state.petExpiresAt, setState, user?.uid]);

  // Derived State (Condition)
  const [condition, setCondition] = useState<CharacterCondition>(() =>
    evaluateCondition(state.stats, state.isSick)
  );

  // 2. Game Tick Loop
  const { pauseTick, resumeTick } = useNurturingTick(user, guestId, state, setState, setCondition);

  // 3. Actions
  const actions = useNurturingActions(setState, setCondition, stateRef, user?.uid);

  // 4. Evolution Logic
  const evolution = useEvolutionLogic(
    user,
    isGuest,
    state,
    setState
  );

  // 5. Remaining Logic (Not extracted to keep hooks focused or too specific)
  // setCharacterState, setCharacterName, resetGame, etc.

  const setCharacterState = useCallback((id: string, stage: number) => {
    setState(currentState => {
      const unlockedMap = currentState.unlockedJellos || {};
      const currentUnlocks = unlockedMap[id] || [];
      const newUnlocks = new Set(currentUnlocks);
      for (let i = 1; i <= stage; i++) {
        newUnlocks.add(i);
      }

      return {
        ...currentState,
        speciesId: id,
        evolutionStage: stage,
        unlockedJellos: {
          ...unlockedMap,
          [id]: Array.from(newUnlocks).sort((a, b) => a - b)
        }
      };
    });
  }, [setState]);

  const setCharacterName = useCallback((name: string) => {
    setState(currentState => {
      const newState = { ...currentState, characterName: name };
      if (user) {
        // Force specific field update or full sync
        syncUserData(user, newState);
      }
      return newState;
    });
  }, [user, setState]);

  const resetGame = useCallback(() => {
    setState((currentState) => {
      const existingGro = currentState.gro || 20;
      const newState = resetNurturingState();

      const preservedState = {
        ...newState,
        gro: existingGro,
        hasCharacter: false,
        gameDifficulty: null,
      };

      if (user) {
        syncUserData(user, preservedState);
      }

      setCondition(evaluateCondition(newState.stats, false));
      return preservedState;
    });
  }, [user, setState]);

  const toggleSleep = useCallback(() => {
    setState((currentState) => {
      const nextIsSleeping = !currentState.isSleeping;
      console.log(nextIsSleeping ? '😴 젤로가 잠들었습니다.' : '🌅 젤로가 일어났습니다.');
      return {
        ...currentState,
        isSleeping: nextIsSleeping,
        sleepStartTime: nextIsSleeping ? Date.now() : undefined,
      };
    });
  }, [setState]);

  const setGameDifficulty = useCallback((difficulty: number | null) => {
    console.log(`🎮 Game Difficulty Set: ${difficulty}`);
    setState((currentState) => ({ ...currentState, gameDifficulty: difficulty }));
  }, [setState]);

  const setLastPlayedGameId = useCallback((id: string) => {
    setState((currentState) => {
      // Only update if changed to avoid renders
      if (currentState.lastPlayedGameId === id) return currentState;
      return { ...currentState, lastPlayedGameId: id };
    });
  }, [setState]);

  const recordGameScore = useCallback((gameId: string, score: number, incrementPlayCount: boolean = true, starsEarned: number = 0) => {
    setState(currentState => {
      const scoresMap = currentState.gameScores || {};
      const currentValue = scoresMap[gameId];
      const { highScore: oldHigh, clearCount: oldCount } = parseGameScore(currentValue);

      const newHighScore = Math.max(oldHigh, score);
      const newClearCount = incrementPlayCount ? oldCount + 1 : oldCount;

      const category = getProgressionCategory(gameId);
      const threshold = category ? getUnlockThreshold(category) : 4;
      const isUnlocked = newClearCount >= threshold;

      const newScoreValue = createGameScore(newHighScore, newClearCount, isUnlocked);

      let updatedCategoryProgress = currentState.categoryProgress;
      if (isUnlocked && category) {
        const order = getDynamicGameOrder(GAMES, category);
        const currentIndex = order.indexOf(gameId);
        const nextGameId = order[currentIndex + 1];
        if (nextGameId) {
          updatedCategoryProgress = updateCategoryProgress(
            nextGameId,
            currentState.categoryProgress,
            GAMES
          );
        }
      }

      let newTotalStars = currentState.totalGameStars || 0;
      if (starsEarned > 0) {
        newTotalStars += starsEarned;
      }

      const newState = {
        ...currentState,
        totalGameStars: newTotalStars,
        gameScores: {
          ...scoresMap,
          [gameId]: newScoreValue
        },
        categoryProgress: updatedCategoryProgress,
        lastActiveTime: Date.now(), // [CRITICAL] Update timestamp to prevent sync overwrite
      };

      saveNurturingState(newState, user?.uid); // Force Save immediately (Fixes navigation data loss)
      return newState;
    });
  }, [user?.uid, setState]);

  const debugUnlockAllGames = useCallback(() => {
    setState((currentState) => {
      const newCategoryProgress = { ...currentState.categoryProgress };
      const categories = ['math-adventure', 'math-genius', 'brain-adventure'];

      categories.forEach(category => {
        const games = getDynamicGameOrder(GAMES, category);
        if (games.length > 0) {
          newCategoryProgress[category] = games[games.length - 1];
        }
      });

      console.log('🔓 [DEBUG] All Games Unlocked:', newCategoryProgress);
      alert('✅ All Games Unlocked! (Debug Mode)');
      return { ...currentState, categoryProgress: newCategoryProgress };
    });
  }, [setState]);

  const debugAddStars = useCallback((amount: number) => {
    setState((currentState) => {
      const newStars = (currentState.totalGameStars || 0) + amount;
      alert(`✅ Added ${amount} Stars!\nNew total: ${newStars}`);
      return {
        ...currentState,
        totalGameStars: newStars
      };
    });
  }, [setState]);

  // Need to implement resetGame properly with imports

  const abandonmentStatus = getAbandonmentStatusUI(state.abandonmentState, Date.now());

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
    speciesId: state.speciesId,
    characterName: state.characterName,
    unlockedJellos: state.unlockedJellos,

    // Hooks
    ...actions,
    ...evolution,
    showSignupModal: evolution.showSignupModal,
    setShowSignupModal: evolution.setShowSignupModal,

    saveToCloud,
    purchasePlan,
    cancelSubscription,
    subscription,
    pauseTick,
    resumeTick,

    // Local methods
    setCharacterState,
    setCharacterName,
    resetGame,
    setGameDifficulty,
    recordGameScore,
    toggleSleep,
    debugUnlockAllGames,
    debugAddStars,

    hasCharacter: state.hasCharacter ?? false,
    completeCharacterCreation,

    isSleeping: state.isSleeping || false,
    currentHouseId: state.currentHouseId || 'tent',
    inventory: state.inventory || ['default_ground'],
    totalGameStars: state.totalGameStars || 0,

    // Pet System
    currentPetId: state.currentPetId,
    petExpiresAt: state.petExpiresAt,
    purchaseRandomPet: actions.purchaseRandomPet,

    isGlobalLoading,

    // UX
    lastPlayedGameId: state.lastPlayedGameId,
    setLastPlayedGameId,

  }), [
    state,
    condition,
    abandonmentStatus,
    actions,
    evolution,
    saveToCloud,
    purchasePlan,
    subscription,
    cancelSubscription,
    pauseTick,
    resumeTick,
    setCharacterState,
    setCharacterName,
    setGameDifficulty,
    setLastPlayedGameId,
    recordGameScore,
    toggleSleep,
    debugUnlockAllGames,
    debugAddStars,
    completeCharacterCreation,
    user,
    isGlobalLoading
  ]);

  return <NurturingContext.Provider value={value}>{children}</NurturingContext.Provider>;
};
