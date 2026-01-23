/**
 * useEvolutionLogic Hook
 * Handles character growth, evolution checks, graduation, and rewards.
 */

import { useState, useCallback } from 'react';
import type { User } from 'firebase/auth';
import type { NurturingPersistentState, HallOfFameEntry } from '../../types/nurturing';
import { CHARACTER_SPECIES } from '../../data/species';
import { addXPAndCheckEvolution } from '../../services/evolutionService';
import { saveToHallOfFame, startNewGeneration, saveFailSafeLastSeenStage } from '../../services/persistenceService';
import { syncUserData } from '../../services/syncService';

export const useEvolutionLogic = (
    user: User | null,
    setState: React.Dispatch<React.SetStateAction<NurturingPersistentState>>
) => {
    const [isEvolving, setIsEvolving] = useState(false);
    const [showEvolutionChoice, setShowEvolutionChoice] = useState(false);
    const [isGraduating, setIsGraduating] = useState(false);

    // Add Rewards & Check Evolution
    const addRewards = useCallback((xpAmount: number, groAmount: number) => {
        setState((currentState) => {
            let conditions = undefined;
            if (currentState.speciesId && CHARACTER_SPECIES[currentState.speciesId]) {
                const species = CHARACTER_SPECIES[currentState.speciesId];
                const stage5 = species.evolutions.find(e => e.stage === 5);
                if (stage5) {
                    conditions = stage5.unlockConditions;
                }
            }

            const { newXP, newStage, evolved, canGraduate, showChoicePopup } = addXPAndCheckEvolution(
                currentState.xp,
                (currentState.evolutionStage || 1) as import('../../types/character').EvolutionStage,
                xpAmount,
                {
                    foodsEaten: currentState.history?.foodsEaten || {},
                    gamesPlayed: currentState.history?.gamesPlayed || {},
                    actionsPerformed: currentState.history?.actionsPerformed || {},
                    totalLifetimeGroEarned: currentState.history?.totalLifetimeGroEarned || 0,
                } as any,
                conditions,
                currentState.totalGameStars || 0
            );

            if (showChoicePopup) {
                setShowEvolutionChoice(true);
            }

            const newState = {
                ...currentState,
                xp: newXP,
                gro: currentState.gro + groAmount,
                totalCurrencyEarned: currentState.totalCurrencyEarned + groAmount,
                evolutionStage: evolved ? newStage : currentState.evolutionStage,
            };

            if (evolved && !showChoicePopup) {
                setIsEvolving(true);
            }

            if (canGraduate) {
                setIsGraduating(true);
            }

            return newState;
        });
    }, [setState]);

    // Evolve to Stage 5 (Choice)
    const evolveToStage5 = useCallback(() => {
        setState(currentState => {
            const cost = 1000;
            if ((currentState.totalGameStars || 0) < cost) {
                console.warn("Attempted Stage 5 evolution without enough stars");
                return currentState;
            }

            const newState = {
                ...currentState,
                totalGameStars: (currentState.totalGameStars || 0) - cost,
                evolutionStage: 5,
            };

            setShowEvolutionChoice(false);
            setIsEvolving(true);

            return newState;
        });
    }, [setState]);

    // Graduate at Stage 4 (Choice)
    const graduateAtStage4 = useCallback(() => {
        setShowEvolutionChoice(false);
        setIsGraduating(true);
    }, []);

    const completeEvolutionAnimation = useCallback(() => {
        setState(currentState => {
            const newState = {
                ...currentState,
                lastSeenStage: currentState.evolutionStage
            };

            saveFailSafeLastSeenStage(currentState.evolutionStage);

            if (user) {
                console.log('☁️ Evolution milestone reached. Syncing to cloud...');
                syncUserData(user, newState);
            }
            return newState;
        });
        setIsEvolving(false);
    }, [user, setState]);

    const completeGraduationAnimation = useCallback((name: string) => {
        let nextState: NurturingPersistentState;
        setState(currentState => { // Need access to current state for snapshot
            // Note: Logic requires state access. setState updater provides latest state.

            const entry: HallOfFameEntry = {
                id: Date.now().toString(),
                name: name || 'Jello',
                speciesId: currentState.speciesId || 'yellowJello',
                finalStage: currentState.evolutionStage || 4,
                graduatedAt: Date.now(),
                finalStats: currentState.stats
            };

            const stateWithEntry = saveToHallOfFame(currentState, entry);
            nextState = startNewGeneration(stateWithEntry);

            return nextState;
        });

        // Since we used updater, we can't reliably get 'nextState' out from inside sync-ly for other calls 
        // unless we trust the updater runs first. 
        // To be safe, we let setState handle the update and just reset flags.

        setIsGraduating(false);
        setIsEvolving(false);
    }, [setState]);

    return {
        isEvolving,
        showEvolutionChoice,
        isGraduating,
        addRewards,
        evolveToStage5,
        graduateAtStage4,
        completeEvolutionAnimation,
        completeGraduationAnimation,
        setShowEvolutionChoice // Needed? Maybe not exposed in original context but we might need to set it? 
        // Actually original context only exposes 'showEvolutionChoice' boolean and action methods.
    };
};
