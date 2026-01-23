/**
 * useNurturingTick Hook
 * Manages the game loop (5-second tick) and automatic state updates.
 */

import { useEffect, useRef, useCallback } from 'react';
import type { User } from 'firebase/auth';
import type { NurturingPersistentState, NurturingStats, CharacterCondition } from '../../types/nurturing';
import { TICK_INTERVAL_MS, POOP_CONFIG } from '../../constants/nurturing';
import { executeGameTick, clampStat, checkAbandonmentState } from '../../services/gameTickService';
import { convertPendingToPoop } from '../../services/actionService';

export const useNurturingTick = (
    user: User | null,
    state: NurturingPersistentState,
    setState: React.Dispatch<React.SetStateAction<NurturingPersistentState>>,
    setCondition: (condition: CharacterCondition) => void
) => {
    const tickIntervalRef = useRef<number | null>(null);

    const runGameTick = useCallback(() => {
        setState((currentState) => {
            // Auto-Wake Check (30 mins)
            let isStillSleeping = currentState.isSleeping || false;
            if (isStillSleeping && currentState.sleepStartTime) {
                const sleepDuration = Date.now() - currentState.sleepStartTime;
                if (sleepDuration >= 30 * 60 * 1000) {
                    isStillSleeping = false;
                    console.log('⏰ 30분 경과: 젤로가 잠에서 깨어났습니다!');
                }
            }

            const tickResult = executeGameTick(
                currentState.stats,
                currentState.poops,
                currentState.bugs || [],
                currentState.gameDifficulty ?? null,
                currentState.isSick,
                isStillSleeping
            );

            const newStats: NurturingStats = {
                fullness: clampStat(currentState.stats.fullness + (tickResult.statChanges.fullness || 0)),
                health: clampStat(currentState.stats.health + (tickResult.statChanges.health || 0)),
                happiness: clampStat(currentState.stats.happiness + (tickResult.statChanges.happiness || 0)),
            };

            const now = Date.now();
            const pendingPoops = currentState.pendingPoops || [];
            const readyPoops = pendingPoops.filter(p => p.scheduledAt <= now);
            const remainingPendingPoops = pendingPoops.filter(p => p.scheduledAt > now);

            let newPoops = [...currentState.poops];
            readyPoops.forEach(pending => {
                if (newPoops.length < POOP_CONFIG.MAX_POOPS) {
                    const newPoop = convertPendingToPoop(pending);
                    newPoops.push(newPoop);
                    newStats.health = clampStat(newStats.health + pending.healthDebuff);
                    console.log('💩 똥이 나왔어요!');
                }
            });

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
                isSick: tickResult.newIsSick,
                sickProgress: tickResult.newIsSick && !currentState.isSick ? 0 : currentState.sickProgress,
                pendingPoops: remainingPendingPoops,
                abandonmentState: updatedAbandonmentState,
                lastActiveTime: Date.now(),
                isSleeping: isStillSleeping,
                sleepStartTime: isStillSleeping ? currentState.sleepStartTime : undefined,
                tickConfig: {
                    ...currentState.tickConfig,
                    lastTickTime: Date.now(),
                },
            };

            setCondition(tickResult.condition);

            if (tickResult.alerts.length > 0) {
                tickResult.alerts.forEach(alert => console.log('[Game Tick]', alert));
            }

            return newState;
        });
    }, [setState, setCondition]); // setCondition is stable from useState/hook

    useEffect(() => {
        if (!user || !state.tickConfig.isActive) {
            if (tickIntervalRef.current) {
                clearInterval(tickIntervalRef.current);
                tickIntervalRef.current = null;
            }
            return;
        }

        console.log('⏰ Tick started (Interval set)');
        tickIntervalRef.current = window.setInterval(() => {
            runGameTick();
        }, TICK_INTERVAL_MS);

        return () => {
            if (tickIntervalRef.current) {
                clearInterval(tickIntervalRef.current);
            }
        };
    }, [state.tickConfig.isActive, runGameTick, user]);

    const pauseTick = useCallback(() => {
        console.log('⏸️ Pausing tick...');
        setState((currentState) => ({
            ...currentState,
            tickConfig: { ...currentState.tickConfig, isActive: false },
        }));
    }, [setState]);

    const resumeTick = useCallback(() => {
        setState((currentState) => {
            if (currentState.tickConfig.isActive) return currentState;
            console.log('▶️ Resuming tick...');
            return {
                ...currentState,
                tickConfig: { ...currentState.tickConfig, isActive: true },
            };
        });
    }, [setState]);

    return { pauseTick, resumeTick };
};
