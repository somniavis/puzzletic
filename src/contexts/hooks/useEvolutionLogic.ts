/**
 * useEvolutionLogic Hook
 * Handles character growth, evolution checks, graduation, and rewards.
 * 
 * [Redesign v2] Logic Flow:
 * 1. addRewards() -> update XP -> changes state
 * 2. evolutionPhase derived from state
 * 3. triggerEvolution/Graduation() -> sets animation flags
 * 4. completeAnimation() -> updates stage/level
 */

import { useState, useCallback, useMemo } from 'react';
import type { User } from 'firebase/auth';
import type { NurturingPersistentState, HallOfFameEntry } from '../../types/nurturing';
import type { EvolutionStage } from '../../types/gameMechanics';
import {
    getEvolutionPhase,
    calculateNextState,
    getNextStageInfo
} from '../../services/evolutionService';
import { addToHallOfFame, createNewGenerationState, saveFailSafeLastSeenStage } from '../../services/persistenceService';
import { syncUserData } from '../../services/syncService';

export const useEvolutionLogic = (
    user: User | null,
    // The hook needs access to the CURRENT state to calculate phase
    state: NurturingPersistentState,
    setState: React.Dispatch<React.SetStateAction<NurturingPersistentState>>
) => {
    // UI Animation States
    const [isEvolving, setIsEvolving] = useState(false);
    const [isGraduating, setIsGraduating] = useState(false);

    // Derived State: Calculate current phase instantly from state
    const evolutionPhase = useMemo(() => {
        return getEvolutionPhase(
            (state.evolutionStage || 1) as EvolutionStage,
            state.xp,
            state.totalGameStars
        );
    }, [state.evolutionStage, state.xp, state.totalGameStars]);

    // 1. Add Rewards (XP/Gro)
    const addRewards = useCallback((xpAmount: number, groAmount: number) => {
        setState((currentState) => {
            const { newXP } = calculateNextState(
                currentState.xp,
                (currentState.evolutionStage || 1) as EvolutionStage,
                xpAmount,
                currentState.totalGameStars || 0
            );

            return {
                ...currentState,
                xp: newXP,
                gro: currentState.gro + groAmount,
                totalCurrencyEarned: currentState.totalCurrencyEarned + groAmount,
            };
        });
    }, [setState]);

    // 2. Trigger Evolution (Manual Action from UI)
    const triggerEvolution = useCallback(() => {
        // Validation: Can we actually evolve?
        if (evolutionPhase !== 'READY_TO_EVOLVE' && evolutionPhase !== 'LEGENDARY_READY') {
            console.warn('⚠️ Cannot evolve in current phase:', evolutionPhase);
            return;
        }
        setIsEvolving(true);
    }, [evolutionPhase]);

    // 3. Complete Evolution (Called after Animation finishes)
    const completeEvolutionAnimation = useCallback(() => {
        setState(currentState => {
            const currentStage = (currentState.evolutionStage || 1) as EvolutionStage;
            const nextInfo = getNextStageInfo(currentStage);

            if (!nextInfo) return currentState;

            // Cost for Legendary Evolution
            let newStars = currentState.totalGameStars || 0;
            if (currentStage === 4 && nextInfo.nextStage === 5) {
                newStars -= 1000;
            }

            const newState = {
                ...currentState,
                evolutionStage: nextInfo.nextStage,
                totalGameStars: newStars,
                lastSeenStage: nextInfo.nextStage,
                unlockedJellos: {
                    ...(currentState.unlockedJellos || {}),
                    [currentState.speciesId || 'yellowJello']: [
                        ...(currentState.unlockedJellos?.[currentState.speciesId || 'yellowJello'] || []),
                        nextInfo.nextStage
                    ].filter((v, i, a) => a.indexOf(v) === i).sort((a, b) => a - b)
                }
            };

            saveFailSafeLastSeenStage(newState.evolutionStage);

            if (user) {
                syncUserData(user, newState);
            }
            return newState;
        });
        setIsEvolving(false);
    }, [user, setState]);

    // 4. Trigger Graduation (Manual Action from UI)
    const triggerGraduation = useCallback(() => {
        if (evolutionPhase !== 'MATURE' && evolutionPhase !== 'LEGENDARY_READY' && evolutionPhase !== 'MAX_LEVEL') {
            console.warn('⚠️ Cannot graduate in current phase:', evolutionPhase);
            return;
        }
        setIsGraduating(true);
    }, [evolutionPhase]);

    // 5. Complete Graduation (Called after Animation finishes)
    const completeGraduationAnimation = useCallback((name: string) => {
        setState(currentState => {
            const entry: HallOfFameEntry = {
                id: Date.now().toString(),
                name: name || 'Jello',
                speciesId: currentState.speciesId || 'yellowJello',
                finalStage: currentState.evolutionStage || 4,
                graduatedAt: Date.now(),
                finalStats: currentState.stats
            };

            // Save & Reset (Pure Functions now)
            // No redundant local saves here, rely on useNurturingSync auto-save + syncUserData
            const stateWithEntry = addToHallOfFame(currentState, entry);
            const nextState = createNewGenerationState(stateWithEntry);

            if (user) {
                syncUserData(user, nextState);
            }

            return nextState;
        });
        setIsGraduating(false);
        // Force reset evolution flags
        setIsEvolving(false);
    }, [user, setState]);

    return {
        evolutionPhase,
        isEvolving,
        isGraduating,
        addRewards,
        triggerEvolution,
        triggerGraduation,
        completeEvolutionAnimation,
        completeGraduationAnimation
    };
};
