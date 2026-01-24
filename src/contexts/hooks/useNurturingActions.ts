/**
 * useNurturingActions Hook
 * Handles all user interactions (Feed, Clean, Play, etc.)
 */

import { useCallback } from 'react';
import type {
    NurturingPersistentState,
    NurturingStats,
    ActionResult,
    CharacterCondition,
    PendingPoop
} from '../../types/nurturing';
import type { FoodItem } from '../../types/food';
import type { MedicineItem } from '../../types/medicine';
import type { CleaningTool } from '../../types/cleaning';

import {
    feedCharacter as serviceFeed,
    giveMedicine as serviceGiveMedicine,
    cleanRoom as serviceClean,
    playWithCharacter as servicePlay,
    studyWithCharacter as serviceStudy,
    takeShower as serviceTakeShower,
    brushTeeth as serviceBrushTeeth,
    removePoop
} from '../../services/actionService';
import { evaluateCondition, clampStat } from '../../services/gameTickService';
import { saveNurturingState } from '../../services/persistenceService';

export const useNurturingActions = (
    setState: React.Dispatch<React.SetStateAction<NurturingPersistentState>>,
    setCondition: (condition: CharacterCondition) => void,
    stateRef: React.MutableRefObject<NurturingPersistentState>,
    userId?: string
) => {

    const performAction = useCallback(<T extends ActionResult>(
        actionFn: (currentState: NurturingPersistentState) => T,
        onSuccess?: (result: T, newState: NurturingPersistentState) => Partial<NurturingPersistentState>
    ): T => {
        let result: T = { success: false, statChanges: {} } as T;

        setState((currentState) => {
            // 1. Service Function
            result = actionFn(currentState);

            if (!result.success) {
                return currentState;
            }

            // 2. Base Stat Update
            const currentStats = currentState.stats;
            const statChanges = result.statChanges || {};

            const newStats: NurturingStats = {
                fullness: clampStat(currentStats.fullness + (statChanges.fullness || 0)),
                health: clampStat(currentStats.health + (statChanges.health || 0)),
                happiness: clampStat(currentStats.happiness + (statChanges.happiness || 0)),
            };

            // 3. Base New State
            let newState: NurturingPersistentState = {
                ...currentState,
                stats: newStats,
                lastActiveTime: Date.now(),
            };

            // 4. Callbacks
            if (onSuccess) {
                const additionalUpdates = onSuccess(result, newState);
                newState = { ...newState, ...additionalUpdates };
            }

            // 5. Condition Update
            // Use eval with potentially new isSick status
            setCondition(evaluateCondition(newState.stats, newState.isSick));

            return newState;
        });

        return result;
    }, [setState, setCondition]);

    const feed = useCallback((food: FoodItem): ActionResult => {
        return performAction(
            (currentState) => serviceFeed(currentState.stats, food.id, currentState.poops, currentState.pendingPoops || []),
            (result, _newState) => {
                const newHistory = {
                    ...(_newState.history || {
                        foodsEaten: {}, gamesPlayed: {}, actionsPerformed: {}, totalLifetimeGroEarned: 0
                    })
                };
                newHistory.foodsEaten = { ...newHistory.foodsEaten };
                newHistory.foodsEaten[food.id] = (newHistory.foodsEaten[food.id] || 0) + 1;

                if ('pendingPoopScheduled' in result && result.pendingPoopScheduled) {
                    const pending = result.pendingPoopScheduled as PendingPoop;
                    console.log('💩 똥 예약됨!', Math.round((pending.scheduledAt - Date.now()) / 1000), '초 후');
                    return {
                        pendingPoops: [...(_newState.pendingPoops || []), pending],
                        history: newHistory
                    };
                }
                return { history: newHistory };
            }
        );
    }, [performAction]);

    const giveMedicine = useCallback((medicine: MedicineItem): ActionResult => {
        return performAction(
            (currentState) => serviceGiveMedicine(currentState.stats, medicine.id, currentState.isSick),
            (result, currentState) => {
                const newHistory = {
                    ...(currentState.history || {
                        foodsEaten: {}, gamesPlayed: {}, actionsPerformed: {}, totalLifetimeGroEarned: 0
                    })
                };
                newHistory.actionsPerformed = { ...newHistory.actionsPerformed };
                newHistory.actionsPerformed['giveMedicine'] = (newHistory.actionsPerformed['giveMedicine'] || 0) + 1;

                let newIsSick = currentState.isSick;
                let newSickProgress = currentState.sickProgress || 0;

                const cureDelta = (result as any).cureProgressDelta;

                if (cureDelta && cureDelta > 0) {
                    newSickProgress += cureDelta;
                    if (newSickProgress >= 2) {
                        newIsSick = false;
                        newSickProgress = 0;
                        console.log('💊 질병이 완치되었습니다!');
                    } else {
                        console.log(`💊 치료 진행 중... (${newSickProgress}/2)`);
                    }
                }
                return { isSick: newIsSick, sickProgress: newSickProgress, history: newHistory };
            }
        );
    }, [performAction]);

    const clean = useCallback((_tool: CleaningTool): ActionResult => {
        return performAction(
            (currentState) => serviceClean(currentState.stats, currentState.poops),
            (_result, currentState) => {
                const newHistory = {
                    ...(currentState.history || {
                        foodsEaten: {}, gamesPlayed: {}, actionsPerformed: {}, totalLifetimeGroEarned: 0
                    })
                };
                newHistory.actionsPerformed = { ...newHistory.actionsPerformed };
                newHistory.actionsPerformed['clean'] = (newHistory.actionsPerformed['clean'] || 0) + 1;

                return { poops: [], history: newHistory };
            }
        );
    }, [performAction]);

    const play = useCallback((): ActionResult => {
        return performAction((currentState) => servicePlay(currentState.stats),
            (_result, currentState) => {
                const newHistory = {
                    ...(currentState.history || {
                        foodsEaten: {}, gamesPlayed: {}, actionsPerformed: {}, totalLifetimeGroEarned: 0
                    })
                };
                newHistory.actionsPerformed = { ...newHistory.actionsPerformed };
                newHistory.actionsPerformed['play'] = (newHistory.actionsPerformed['play'] || 0) + 1;
                return { history: newHistory };
            });
    }, [performAction]);

    const study = useCallback((): ActionResult => {
        return performAction(
            (currentState) => serviceStudy(currentState.stats),
            (result, currentState) => {
                const currencyEarned = result.sideEffects?.currencyEarned || 0;

                const newHistory = {
                    ...(currentState.history || {
                        foodsEaten: {}, gamesPlayed: {}, actionsPerformed: {}, totalLifetimeGroEarned: 0
                    })
                };
                newHistory.actionsPerformed = { ...newHistory.actionsPerformed };
                newHistory.actionsPerformed['study'] = (newHistory.actionsPerformed['study'] || 0) + 1;
                newHistory.totalLifetimeGroEarned = (newHistory.totalLifetimeGroEarned || 0) + currencyEarned;

                return {
                    gro: (currentState.gro || 0) + currencyEarned,
                    totalCurrencyEarned: currentState.totalCurrencyEarned + currencyEarned,
                    studyCount: currentState.studyCount + 1,
                    history: newHistory
                };
            }
        );
    }, [performAction]);

    const spendGro = useCallback((amount: number): boolean => {
        let success = false;
        setState((currentState) => {
            if ((currentState.gro || 0) < amount) {
                success = false;
                return currentState;
            }
            success = true;
            return {
                ...currentState,
                gro: (currentState.gro || 0) - amount,
            };
        });
        return success;
    }, [setState]);

    const cleanAll = useCallback((cost: number = 0): ActionResult => {
        let result: ActionResult = { success: false, statChanges: {} };

        setState((currentState) => {
            if ((currentState.gro || 0) < cost) {
                result = { success: false, statChanges: {}, message: '돈이 부족해요!' };
                return currentState;
            }

            const poopCount = currentState.poops.length;
            const bugCount = (currentState.bugs || []).length;

            if (poopCount === 0 && bugCount === 0) {
                result = { success: false, statChanges: {}, message: '청소할 것이 없어요.' };
                return currentState;
            }

            const healthBonus = (poopCount * 2) + (bugCount * 1);
            const happinessBonus = (poopCount * 2) + (bugCount * 3);

            const newStats: NurturingStats = {
                ...currentState.stats,
                happiness: clampStat(currentState.stats.happiness + happinessBonus),
                health: clampStat(currentState.stats.health + healthBonus),
            };

            setCondition(evaluateCondition(newStats));

            result = {
                success: true,
                statChanges: { happiness: happinessBonus, health: healthBonus },
                message: `말끔히 청소했어요! (똥 ${poopCount}, 벌레 ${bugCount})`
            };

            return {
                ...currentState,
                gro: (currentState.gro || 0) - cost,
                stats: newStats,
                poops: [],
                bugs: [],
                lastActiveTime: Date.now(),
            };
        });

        return result;
    }, [setState, setCondition]);

    const maxStats = useCallback((): ActionResult => {
        let result: ActionResult = { success: true, statChanges: {}, message: '회복됨' };
        setState((currentState) => {
            const newStats = { fullness: 100, health: 100, happiness: 100 };
            setCondition(evaluateCondition(newStats));
            result = { success: true, statChanges: newStats, message: '모든 상태가 회복되었습니다!' };
            return {
                ...currentState,
                stats: newStats,
                isSick: false,
                sickProgress: 0,
                lastActiveTime: Date.now(),
            };
        });
        return result;
    }, [setState, setCondition]);

    const takeShower = useCallback((): ActionResult => {
        return performAction((currentState) => serviceTakeShower(currentState.stats));
    }, [performAction]);

    const brushTeeth = useCallback((): ActionResult => {
        return performAction((currentState) => serviceBrushTeeth(currentState.stats));
    }, [performAction]);

    const clickPoop = useCallback((poopId: string, happinessBonus: number = 0) => {
        setState((currentState) => {
            const { updatedPoops, removed } = removePoop(poopId, currentState.poops);

            if (!removed) {
                return currentState;
            }

            const newStats: NurturingStats = {
                ...currentState.stats,
                happiness: clampStat(currentState.stats.happiness + happinessBonus),
                health: clampStat(currentState.stats.health + 2),
            };

            setCondition(evaluateCondition(newStats));

            return {
                ...currentState,
                stats: newStats,
                poops: updatedPoops,
            };
        });
    }, [setState, setCondition]);

    const clickBug = useCallback((bugId: string) => {
        setState((currentState) => {
            const bugs = currentState.bugs || [];
            const bugToRemove = bugs.find(b => b.id === bugId);

            if (!bugToRemove) {
                return currentState;
            }

            const updatedBugs = bugs.filter(b => b.id !== bugId);

            const newStats: NurturingStats = {
                ...currentState.stats,
                happiness: clampStat(currentState.stats.happiness + 3),
                health: clampStat(currentState.stats.health + 1),
            };

            setCondition(evaluateCondition(newStats));

            return {
                ...currentState,
                stats: newStats,
                bugs: updatedBugs,
            };
        });
    }, [setState, setCondition]);

    const cleanBug = useCallback((): ActionResult => {
        let result: ActionResult = { success: false, statChanges: {} };

        setState((currentState) => {
            const bugs = currentState.bugs || [];

            if (bugs.length === 0) {
                result = { success: false, statChanges: {}, message: '제거할 벌레가 없습니다.' };
                return currentState;
            }

            const updatedBugs = bugs.slice(1);

            const newStats: NurturingStats = {
                ...currentState.stats,
                happiness: clampStat(currentState.stats.happiness + 3),
                health: clampStat(currentState.stats.health + 1),
            };

            setCondition(evaluateCondition(newStats));
            result = { success: true, statChanges: { happiness: 3, health: 1 }, message: '벌레 1마리를 제거했습니다!' };

            return {
                ...currentState,
                stats: newStats,
                bugs: updatedBugs,
                lastActiveTime: Date.now(),
            };
        });

        return result;
    }, [setState, setCondition]);

    const purchaseItem = useCallback((itemId: string, price: number): boolean => {
        const current = stateRef.current;
        if (current.inventory?.includes(itemId)) return true;
        if ((current.gro || 0) < price) return false;

        setState((currentState) => {
            if (currentState.inventory?.includes(itemId)) return currentState;
            if ((currentState.gro || 0) < price) return currentState;

            const newState = {
                ...currentState,
                gro: (currentState.gro || 0) - price,
                inventory: [...(currentState.inventory || []), itemId],
                lastActiveTime: Date.now(),
            };
            setTimeout(() => saveNurturingState(newState, userId), 0);
            return newState;
        });

        return true;
    }, [stateRef, setState]);

    const equipLand = useCallback((landId: string): boolean => {
        const current = stateRef.current;
        if (landId !== 'default_ground' && !current.inventory?.includes(landId)) {
            console.warn('Cannot equip land not in inventory:', landId);
            return false;
        }
        setState((currentState) => {
            const newState = { ...currentState, currentLand: landId, lastActiveTime: Date.now() };
            setTimeout(() => saveNurturingState(newState, userId), 0);
            return newState;
        });
        return true;
    }, [stateRef, setState]);

    const equipHouse = useCallback((houseId: string): boolean => {
        const current = stateRef.current;
        if (houseId !== 'tent' && !current.inventory?.includes(houseId)) {
            console.warn('Cannot equip house not in inventory:', houseId);
            return false;
        }
        setState((currentState) => {
            const newState = { ...currentState, currentHouseId: houseId, lastActiveTime: Date.now() };
            setTimeout(() => saveNurturingState(newState, userId), 0);
            return newState;
        });
        return true;
    }, [stateRef, setState]);

    return {
        performAction,
        feed,
        giveMedicine,
        clean,
        play,
        study,
        spendGro,
        cleanAll,
        maxStats,
        takeShower,
        brushTeeth,
        clickPoop,
        clickBug,
        cleanBug,
        purchaseItem,
        equipLand,
        equipHouse
    };
};
