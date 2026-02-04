/**
 * useNurturingSync Hook
 * Handles loading, saving, cloud synchronization, and offline generation.
 * 
 * [Security Patch v2] Strict Account Isolation
 * - Prevents data bleeding between accounts by enforcing UID checks.
 * - Clears state immediately on logout/switch.
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

// Security: Max allowed gain per sync to prevent abnormal data
const MAX_XP_GAIN_PER_SYNC = 2000;
const MAX_GRO_GAIN_PER_SYNC = 2000;

// Helper: Validate State Integrity
const validateStateIntegrity = (currentState: NurturingPersistentState, lastSyncedJson: string | null): boolean => {
    if (!lastSyncedJson) return true; // First sync is always trusted (or handled by server)

    try {
        const lastState = JSON.parse(lastSyncedJson) as NurturingPersistentState;
        const xpDiff = (currentState.xp || 0) - (lastState.xp || 0);
        const groDiff = (currentState.gro || 0) - (lastState.gro || 0);

        if (xpDiff > MAX_XP_GAIN_PER_SYNC) {
            console.error(`🛡️ [Security] Blocked Sync: Abnormal XP gain detected (+${xpDiff}). Limit: ${MAX_XP_GAIN_PER_SYNC}`);
            return false;
        }
        if (groDiff > MAX_GRO_GAIN_PER_SYNC) {
            console.error(`🛡️ [Security] Blocked Sync: Abnormal GRO gain detected (+${groDiff}). Limit: ${MAX_GRO_GAIN_PER_SYNC}`);
            return false;
        }
        return true;
    } catch (e) {
        console.warn('Failed to validate integrity, skipping check:', e);
        return true;
    }
};

export const useNurturingSync = (user: User | null, guestId: string | null = null) => {
    const [isGlobalLoading, setIsGlobalLoading] = useState(true);

    // Subscription State
    const [subscription, setSubscription] = useState<SubscriptionState>({
        isPremium: false,
        plan: null,
        expiryDate: null,
    });

    // Initial State Strategy:
    // Sync load from localStorage to prevent "Flash of Default" -> "Autosave Overwrite" race condition.
    const [state, setState] = useState<NurturingPersistentState>(() => {
        if (user?.uid) {
            // Synchronous Load for authenticated user

            const loaded = loadNurturingState(user.uid);
            const { updatedState } = applyOfflineProgress(loaded);
            return updatedState;
        }

        // Guest mode
        const targetId = guestId || undefined;
        // console.log('🔄 [Init] useNurturingSync Init for TargetID:', targetId);

        try {
            const loaded = loadNurturingState(targetId);
            // console.log('🔄 [Init] Loaded Raw State:', { hasCharacter: loaded.hasCharacter, health: loaded.stats?.health });

            const { updatedState } = applyOfflineProgress(loaded);
            // console.log('🔄 [Init] Post-Offline State:', { hasCharacter: updatedState.hasCharacter, health: updatedState.stats?.health });
            return updatedState;
        } catch (e) {
            console.error('🔄 [Init] FAIL:', e);
            return createDefaultState();
        }
    });

    // ========== THROTTLED LOCAL PERSISTENCE ==========
    const debouncedState = useDebounce(state, 1000);

    // Only save if we fully loaded and matches current user
    const hasLoadedRef = useRef(false);

    useEffect(() => {
        // Prevent saving the temporary default state over the real user data
        if (!hasLoadedRef.current && user) {
            return;
        }

        const targetId = user?.uid || guestId || undefined;

        // [SAFETY CHECK] Prevent overwriting valid data with empty state
        // If current state has no character, but storage implies valid data exists, SKIP SAVE.
        // This handles cases where load failed or context switched incompletely.
        if (targetId && !debouncedState.hasCharacter) {
            const existingData = loadNurturingState(targetId);
            if (existingData.hasCharacter) {
                console.warn('🛡️ [Safety] Prevented overwriting valid data with empty state for:', targetId);
                return;
            }
        }

        saveNurturingState(debouncedState, targetId);
    }, [debouncedState, user?.uid, guestId]);
    // =================================================

    const stateRef = useRef(state);
    const lastSyncedStateRef = useRef<string | null>(null);

    useEffect(() => {
        stateRef.current = state;
    }, [state]);

    // Track user changes & Primary Load Logic
    useEffect(() => {
        setCurrentUserId(user?.uid || null);

        if (user?.uid) {
            // [CRITICAL] Switching Account detected
            setIsGlobalLoading(true);
            hasLoadedRef.current = false; // Disable autosave during switch



            // 2. Load User Specific Data
            const userState = loadNurturingState(user.uid);
            const { updatedState } = applyOfflineProgress(userState);

            if (updatedState.lastSeenStage) {
                const currentStored = getFailSafeLastSeenStage() || 0;
                if (updatedState.lastSeenStage > currentStored) {
                    saveFailSafeLastSeenStage(updatedState.lastSeenStage);
                }
            }

            setState(updatedState);
            hasLoadedRef.current = true; // Enable autosave
        } else {
            // [Log Out] Switch to Guest Mode
            setIsGlobalLoading(false);

            // Fix: Load guest data using guestId (previously undefined)

            const targetId = guestId || undefined;
            const guestState = loadNurturingState(targetId);
            setState(guestState);
            hasLoadedRef.current = true;
        }
    }, [user?.uid, guestId]);

    // Cloud Sync on Login (Unchanged logic, just ensure it uses current user)
    useEffect(() => {
        if (!user) {
            if (!user && !isGlobalLoading) {
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
                    // Logic: If current local state has data (maybe migrated from guest?), sync it up.
                    // But since we reset state on user switch above, stateRef.current might be empty OR loaded from localStorage(uid).
                    // If local storage was empty (fresh device), state is default.

                    // Note: If we want to support "Guest -> Sign Up" migration, we need to pass that context.
                    // Assuming standard flow:

                    if (stateRef.current.hasCharacter) {
                        // Check if this data belongs to THIS user (check UID in state? No field for that).
                        // Risk: Uploading previous user's data?
                        // Solution: Since we already loaded `loadNurturingState(user.uid)` in previous useEffect,
                        // if `hasCharacter` is true, it means we found LOCALLY cached data for THIS user.
                        // So it's safe to sync up.
                        console.log('☁️ Syncing local cache to new cloud entry.');
                        syncUserData(user, stateRef.current);
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

            // Cloud Validation & Restoration Logic (Unchanged)
            // ... [Keep existing complex merge logic] ...
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

            const cloudStars = parsedGameData.totalGameStars || (cloudData as any).star || 0;
            const localStars = stateRef.current.totalGameStars || 0;

            // Strict Progress Check: If Local has MORE stars, it wins regardless of time/money
            // This protects against "Star Loss" on refresh
            const hasMoreProgress = (localXP >= cloudXP) && (localTotalGro >= cloudTotalGro) && (localStars >= cloudStars);

            const isLocalLegitimatelyNewer = (localTime > cloudTime) && hasMoreProgress;

            if (isLocalLegitimatelyNewer && !isLocalFresh && !isLocalInvalid) {
                console.log(`☁️ Keeping local data (Lazy Sync). Reason: Local is newer.`);
                return;
            }

            console.log('☁️ Cloud data is newer or consistent. Restoring from cloud.');

            const defaultState = createDefaultState();

            const restoredState: NurturingPersistentState = {
                // ... [Full mapping from previous file] ...
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

            // ... [Keep Migration Logic] ...
            // Migration: minigameStats -> gameScores
            if (parsedGameData.minigameStats && !parsedGameData.gameScores) {
                const migratedScores: Record<string, GameScoreValue> = {};
                for (const [gameId, stats] of Object.entries(parsedGameData.minigameStats as Record<string, any>)) {
                    const category = getProgressionCategory(gameId);
                    const threshold = category ? getUnlockThreshold(category) : 4;
                    const isUnlocked = stats.playCount >= threshold;
                    migratedScores[gameId] = createGameScore(stats.highScore, stats.playCount, isUnlocked);
                }
                restoredState.gameScores = migratedScores;
            } else {
                restoredState.gameScores = parsedGameData.gameScores || {};
            }

            restoredState.categoryProgress = parsedGameData.categoryProgress || {};

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

            setState(restoredState);
            lastSyncedStateRef.current = JSON.stringify(restoredState);
            hasLoadedRef.current = true; // Ensure saving is enabled after restore

        }).finally(() => {
            setIsGlobalLoading(false);
        });
    }, [user]);

    // Auto-Save Interval
    useEffect(() => {
        if (!user) return;
        const AUTO_SAVE_INTERVAL = 15 * 60 * 1000;
        const timer = setInterval(() => {
            if (stateRef.current && hasLoadedRef.current) {
                const currentStateStr = JSON.stringify(stateRef.current);
                if (lastSyncedStateRef.current === currentStateStr) return;

                console.log('☁️ Auto-save triggered.');

                // Security Check
                if (!validateStateIntegrity(stateRef.current, lastSyncedStateRef.current)) {
                    console.warn('⚠️ Auto-save skipped due to integrity violation.');
                    return;
                }

                syncUserData(user, stateRef.current).then(success => {
                    if (success) lastSyncedStateRef.current = currentStateStr;
                });
            }
        }, AUTO_SAVE_INTERVAL);
        return () => clearInterval(timer);
    }, [user]);

    // Actions
    const saveToCloud = useCallback(async () => {
        if (!user) return false;
        const safeState = stateRef.current;

        // Security Check
        if (!validateStateIntegrity(safeState, lastSyncedStateRef.current)) {
            alert('⚠️ Sync Blocked: Abnormal data detected (XP/Gro gain too high). Revert changes or reload.');
            return false;
        }

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
            if (user && hasLoadedRef.current) syncUserData(user, newState);
            return newState;
        });
    }, [user]);

    const cancelSubscription = useCallback(async (): Promise<boolean> => {
        if (!user) return false;
        // Mock Cancellation
        setSubscription({
            isPremium: false,
            plan: null,
            expiryDate: null,
        });
        return true;
    }, [user]);

    return {
        state,
        setState,
        isGlobalLoading,
        subscription,
        setSubscription,
        saveToCloud,
        purchasePlan,
        cancelSubscription, // [NEW]
        stateRef,
        completeCharacterCreation
    };
};
