/**
 * useNurturingSync Hook
 * Handles loading, saving, cloud synchronization, and offline generation.
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import type { User } from 'firebase/auth';
import type { NurturingPersistentState } from '../../types/nurturing';
import type { GameScoreValue, Poop, PendingPoop, Bug, BugType } from '../../types/nurturing';
import {
    loadNurturingState,
    saveNurturingState,
    applyOfflineProgress,
    createDefaultState,
    setCurrentUserId,
    saveFailSafeLastSeenStage,
    getFailSafeLastSeenStage
} from '../../services/persistenceService';
import { syncUserData, fetchUserData, purchaseSubscription } from '../../services/syncService';
import { useDebounce } from '../../hooks/useDebounce';
import { getProgressionCategory, getUnlockThreshold, createGameScore } from '../../utils/progression';

export interface SubscriptionState {
    isPremium: boolean;
    plan: '3_months' | '12_months' | null;
    expiryDate: number | null;
}

export const useNurturingSync = (user: User | null) => {
    const [isGlobalLoading, setIsGlobalLoading] = useState(true);

    // Subscription State
    const [subscription, setSubscription] = useState<SubscriptionState>({
        isPremium: false,
        plan: null,
        expiryDate: null,
    });

    // State
    const [state, setState] = useState<NurturingPersistentState>(() => {
        const loaded = loadNurturingState();
        const { updatedState } = applyOfflineProgress(loaded);
        saveNurturingState(updatedState);
        return updatedState;
    });

    // ========== THROTTLED LOCAL PERSISTENCE ==========
    const debouncedState = useDebounce(state, 1000);

    useEffect(() => {
        saveNurturingState(debouncedState, user?.uid);
    }, [debouncedState, user?.uid]);
    // =================================================

    const stateRef = useRef(state);
    const lastSyncedStateRef = useRef<string | null>(null);

    useEffect(() => {
        stateRef.current = state;
    }, [state]);

    // Track user changes
    useEffect(() => {
        setCurrentUserId(user?.uid || null);
        if (user?.uid) {
            setIsGlobalLoading(true);
            console.log('🔄 User changed, loading user-specific data for:', user.uid);
            const userState = loadNurturingState(user.uid);
            const { updatedState } = applyOfflineProgress(userState);

            if (updatedState.lastSeenStage) {
                const currentStored = getFailSafeLastSeenStage() || 0;
                if (updatedState.lastSeenStage > currentStored) {
                    saveFailSafeLastSeenStage(updatedState.lastSeenStage);
                }
            }
            setState(updatedState);
        } else {
            setIsGlobalLoading(false);
        }
    }, [user?.uid]);

    // Cloud Sync on Login
    useEffect(() => {
        if (!user) {
            if (!user && !isGlobalLoading) { // Avoid resetting loading if already done? No, strictly follow original
                // Actually original logic was simpler: if (!user) { setIsGlobalLoading(false); return; }
                setIsGlobalLoading(false);
                return;
            }
            return;
        }

        setIsGlobalLoading(true);
        console.log('☁️ Fetching cloud data for user:', user.uid);

        fetchUserData(user).then((result) => {
            if (!result.success) {
                if (result.notFound) {
                    console.log('☁️ New user detected.');
                    if (stateRef.current.hasCharacter) {
                        console.log('☁️ Syncing guest progress to new account.');
                        const guestState = stateRef.current;
                        syncUserData(user, guestState);
                        saveNurturingState(guestState, user.uid);
                    } else {
                        console.log('☁️ Initializing fresh account state.');
                        const cleanState = createDefaultState();
                        syncUserData(user, cleanState);
                        setState({ ...cleanState, lastActiveTime: Date.now() });
                        saveNurturingState(cleanState, user.uid);
                    }
                } else {
                    console.warn('☁️ Fetch failed:', result.error);
                }
                return;
            }

            const cloudData = result.data;

            if (cloudData.is_premium !== undefined) {
                setSubscription({
                    isPremium: !!cloudData.is_premium,
                    plan: cloudData.subscription_plan as any || null,
                    expiryDate: cloudData.subscription_end || null,
                });
            }

            let parsedGameData = cloudData.gameData || cloudData.game_data;
            if (typeof parsedGameData === 'string') {
                try {
                    parsedGameData = JSON.parse(parsedGameData);
                } catch (e) {
                    console.error('Failed to parse game_data:', e);
                    return;
                }
            }

            if (!parsedGameData || typeof parsedGameData !== 'object') {
                console.warn('☁️ Invalid game_data, keeping local state');
                return;
            }

            console.log('☁️ Cloud data found. Checking versions...');

            const cloudTime = parsedGameData.lastActiveTime || 0;
            const localTime = stateRef.current.lastActiveTime || 0;

            const isLocalInvalid =
                stateRef.current.stats.health === 0 &&
                stateRef.current.stats.fullness === 0 &&
                stateRef.current.stats.happiness === 0;

            const isLocalFresh =
                stateRef.current.xp === 0 &&
                stateRef.current.totalCurrencyEarned === 0 &&
                !stateRef.current.hasCharacter;

            const cloudXP = parsedGameData.xp || 0;
            const localXP = stateRef.current.xp || 0;

            const cloudTotalGro = parsedGameData.totalCurrencyEarned || 0;
            const localTotalGro = stateRef.current.totalCurrencyEarned || 0;

            const cloudHasMoreProgress = (cloudXP > localXP) || (cloudTotalGro > localTotalGro);
            const isLocalLegitimatelyNewer = (localTime > cloudTime + 5000) && (localXP >= cloudXP) && (localTotalGro >= cloudTotalGro);

            if (isLocalLegitimatelyNewer && !isLocalFresh && !isLocalInvalid) {
                console.log(`☁️ Keeping local data (Lazy Sync). Reason: Local is newer AND has >= XP.`);
                return;
            }

            if (cloudHasMoreProgress && localTime > cloudTime) {
                console.warn(`⚠️ Cloud timestamp is older but Cloud XP is higher! Trusting Cloud to prevent data loss.`);
            }

            if (isLocalInvalid) {
                console.warn('⚠️ Local state appears broken (0/0/0). Forcing Cloud Restore.');
            }

            console.log('☁️ Cloud data is newer or consistent. Restoring from cloud.');

            const defaultState = createDefaultState();

            const restoredState: NurturingPersistentState = {
                ...defaultState,
                gro: parsedGameData.gro ?? defaultState.gro,
                xp: parsedGameData.xp ?? defaultState.xp,
                totalCurrencyEarned: parsedGameData.totalCurrencyEarned ?? defaultState.totalCurrencyEarned,
                studyCount: parsedGameData.studyCount ?? defaultState.studyCount,
                gameDifficulty: parsedGameData.gameDifficulty ?? defaultState.gameDifficulty,
                hasCharacter: parsedGameData.hasCharacter ?? defaultState.hasCharacter,
                evolutionStage: parsedGameData.evolutionStage || defaultState.evolutionStage,
                speciesId: parsedGameData.speciesId || stateRef.current.speciesId || defaultState.speciesId,
                characterName: parsedGameData.characterName || stateRef.current.characterName || defaultState.characterName,
                lastSeenStage: parsedGameData.lastSeenStage || defaultState.lastSeenStage,
                inventory: parsedGameData.inventory || defaultState.inventory,
                unlockedJellos: parsedGameData.unlockedJellos || defaultState.unlockedJellos,
                hallOfFame: parsedGameData.hallOfFame || defaultState.hallOfFame,
                currentLand: parsedGameData.currentLand || cloudData.current_land || defaultState.currentLand,
                stats: { ...defaultState.stats, ...(parsedGameData.stats || {}) },
                tickConfig: { ...defaultState.tickConfig, ...(parsedGameData.tickConfig || {}) },
                abandonmentState: { ...defaultState.abandonmentState, ...(parsedGameData.abandonmentState || {}) },
                history: {
                    ...defaultState.history,
                    ...(parsedGameData.history || {}),
                    foodsEaten: { ...(defaultState.history?.foodsEaten || {}), ...(parsedGameData.history?.foodsEaten || {}) },
                    gamesPlayed: { ...(defaultState.history?.gamesPlayed || {}), ...(parsedGameData.history?.gamesPlayed || {}) },
                    actionsPerformed: { ...(defaultState.history?.actionsPerformed || {}), ...(parsedGameData.history?.actionsPerformed || {}) },
                    totalLifetimeGroEarned: (parsedGameData.history?.totalLifetimeGroEarned ?? defaultState.history?.totalLifetimeGroEarned ?? 0),
                },
                currentHouseId: parsedGameData.currentHouseId || cloudData.current_house_id || defaultState.currentHouseId || 'tent',
                isSick: parsedGameData.isSick ?? defaultState.isSick ?? false,
                isSleeping: parsedGameData.isSleeping ?? defaultState.isSleeping ?? false,
                totalGameStars: parsedGameData.totalGameStars ?? (cloudData as any).star ?? 0,
                lastActiveTime: Date.now(),
            };

            // Migration: minigameStats -> gameScores
            if (parsedGameData.minigameStats && !parsedGameData.gameScores) {
                console.log('☁️ [MIGRATION] Converting legacy minigameStats to gameScores...');
                const migratedScores: Record<string, GameScoreValue> = {};
                for (const [gameId, stats] of Object.entries(parsedGameData.minigameStats as Record<string, any>)) {
                    const category = getProgressionCategory(gameId);
                    const threshold = category ? getUnlockThreshold(category) : 4;
                    const isUnlocked = stats.playCount >= threshold;
                    migratedScores[gameId] = createGameScore(stats.highScore, stats.playCount, isUnlocked);
                }
                restoredState.gameScores = migratedScores;
                delete restoredState.minigameStats;
                delete restoredState.totalMinigameScore;
                delete restoredState.totalMinigamePlayCount;
            } else {
                restoredState.gameScores = parsedGameData.gameScores || {};
            }

            restoredState.categoryProgress = parsedGameData.categoryProgress || {};
            if (Object.keys(restoredState.categoryProgress).length === 0) {
                if (stateRef.current.categoryProgress && Object.keys(stateRef.current.categoryProgress).length > 0) {
                    restoredState.categoryProgress = { ...stateRef.current.categoryProgress };
                }
            }

            // Hybrid Storage v2.1: Regenerate Poops/Bugs
            const compactData = parsedGameData as any;
            if (compactData.poopCount !== undefined && !compactData.poops) {
                const regeneratedPoops: Poop[] = [];
                for (let i = 0; i < compactData.poopCount; i++) {
                    regeneratedPoops.push({
                        id: `poop-regen-${Date.now()}-${i}`,
                        x: 20 + Math.random() * 60,
                        y: 20 + Math.random() * 60,
                        createdAt: Date.now(),
                        healthDebuff: -5,
                    });
                }
                restoredState.poops = regeneratedPoops;
            }
            if (compactData.bugCounts && !compactData.bugs) {
                const regeneratedBugs: Bug[] = [];
                for (const [bType, count] of Object.entries(compactData.bugCounts as Record<string, number>)) {
                    for (let j = 0; j < count; j++) {
                        regeneratedBugs.push({
                            id: `bug-regen-${Date.now()}-${bType}-${j}`,
                            type: bType as BugType,
                            x: 20 + Math.random() * 60,
                            y: 20 + Math.random() * 60,
                            createdAt: Date.now(),
                            healthDebuff: -0.5,
                            happinessDebuff: -0.5,
                        });
                    }
                }
                restoredState.bugs = regeneratedBugs;
            }
            if (compactData.pendingPoopCount !== undefined && !compactData.pendingPoops) {
                const regeneratedPending: PendingPoop[] = [];
                for (let k = 0; k < compactData.pendingPoopCount; k++) {
                    regeneratedPending.push({
                        id: `pending-regen-${Date.now()}-${k}`,
                        scheduledAt: Date.now() + (k + 1) * 60000,
                        healthDebuff: -5,
                    });
                }
                restoredState.pendingPoops = regeneratedPending;
            }

            if (parsedGameData.lastSeenStage === undefined) {
                restoredState.lastSeenStage = restoredState.evolutionStage;
            }

            setState(restoredState);
            lastSyncedStateRef.current = JSON.stringify(restoredState);

        }).finally(() => {
            setIsGlobalLoading(false);
        });
    }, [user]);

    // Auto-Save Interval
    useEffect(() => {
        if (!user) return;

        const AUTO_SAVE_INTERVAL = 15 * 60 * 1000;
        console.log('☁️ Auto-save timer started');

        const timer = setInterval(() => {
            if (stateRef.current) {
                const currentStateStr = JSON.stringify(stateRef.current);
                if (lastSyncedStateRef.current === currentStateStr) {
                    return;
                }

                console.log('☁️ Auto-save triggered: Changes detected.');
                syncUserData(user, stateRef.current).then(success => {
                    if (success) {
                        lastSyncedStateRef.current = currentStateStr;
                    }
                });
            }
        }, AUTO_SAVE_INTERVAL);

        return () => clearInterval(timer);
    }, [user]);

    // Actions
    const saveToCloud = useCallback(async () => {
        if (!user) return false;
        const safeState = stateRef.current;
        console.log('☁️ [DEBUG] Manual Save Triggered.');
        const success = await syncUserData(user, safeState);
        if (success) {
            lastSyncedStateRef.current = JSON.stringify(safeState);
        }
        return success;
    }, [user]);

    const purchasePlan = useCallback(async (planId: '3_months' | '12_months'): Promise<boolean> => {
        if (!user) return false;
        const result = await purchaseSubscription(user, planId);
        if (result.success) {
            setSubscription({
                isPremium: !!result.is_premium,
                plan: result.plan as any,
                expiryDate: result.subscription_end || null,
            });
            return true;
        } else {
            return false;
        }
    }, [user]);

    const completeCharacterCreation = useCallback(() => {
        setState((currentState) => {
            const newState = { ...currentState, hasCharacter: true };
            if (user) syncUserData(user, newState);
            return newState;
        });
    }, [user]);

    return {
        state,
        setState,
        isGlobalLoading,
        subscription,
        setSubscription,
        saveToCloud,
        purchasePlan,
        stateRef,
        completeCharacterCreation
    };
};
