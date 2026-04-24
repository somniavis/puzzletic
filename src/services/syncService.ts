/**
 * Sync Service
 * Handles data synchronization with Cloudflare Worker
 */

import type { User } from 'firebase/auth';
import type { NurturingPersistentState } from '../types/nurturing';
import type { DailyRoutineReward } from './dailyRoutineRewardService';
import type { BillingProductId } from '../constants/billingPlans';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://api.grogrojello.com';
const CLIENT_SYNC_COOLDOWN_MS = 2200;
const MAX_SERVER_RATE_LIMIT_WAIT_MS = 15000;
const FETCH_USER_CACHE_TTL_MS = 5000;

const fetchFromApi = (path: string, init?: RequestInit): Promise<Response> => {
    return fetch(`${API_BASE_URL}${path}`, init);
};

type FetchUserCacheEntry = {
    expiresAt: number;
    result: FetchUserResult;
};
type FetchUserOptions = {
    forceFresh?: boolean;
};

type SyncQueueEntry = {
    inFlight: boolean;
    lastAttemptAt: number;
    nextAllowedAt: number;
    pendingState: NurturingPersistentState | null;
    waiters: Array<(success: boolean) => void>;
    timer: ReturnType<typeof setTimeout> | null;
    user: User;
};

type SyncRequestResult =
    | { success: true }
    | { success: false; retryable: boolean; retryAfterMs?: number };

const syncQueue = new Map<string, SyncQueueEntry>();
const fetchUserInflight = new Map<string, Promise<FetchUserResult>>();
const fetchUserCache = new Map<string, FetchUserCacheEntry>();

const invalidateFetchUserCache = (uid: string) => {
    fetchUserCache.delete(uid);
};

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const resolveWaiters = (waiters: Array<(success: boolean) => void>, success: boolean) => {
    for (const resolve of waiters) {
        resolve(success);
    }
};

const parseRetryAfterMs = (response: Response, json?: any): number => {
    const retryAfterHeader = response.headers.get('Retry-After');
    const retryAfterSeconds = retryAfterHeader ? Number(retryAfterHeader) : NaN;
    if (Number.isFinite(retryAfterSeconds) && retryAfterSeconds > 0) {
        return retryAfterSeconds * 1000;
    }

    const retryAfterBody = Number(json?.retryAfterSeconds);
    if (Number.isFinite(retryAfterBody) && retryAfterBody > 0) {
        return retryAfterBody * 1000;
    }

    return CLIENT_SYNC_COOLDOWN_MS;
};

export interface CloudUserData {
    uid: string;
    email: string | null;
    display_name: string | null;
    level: number;
    xp: number;
    gro: number;
    current_land: string;
    inventory: string[];
    game_data?: string; // Raw JSON string from D1 column
    gameData?: NurturingPersistentState; // Parsed object from backend
    created_at: number;
    last_synced_at: number;
    // Subscription fields
    is_premium?: number; // 0 or 1
    subscription_end?: number; // timestamp
    subscription_plan?: string;

    // Redundancy fields (V2.1)
    current_house_id?: string;
}

/**
 * Fetch user data from Cloudflare
 */
export type FetchUserResult =
    | { success: true; data: CloudUserData }
    | { success: false; error: string; notFound?: boolean };

export const fetchUserData = async (user: User, options: FetchUserOptions = {}): Promise<FetchUserResult> => {
    if (options.forceFresh) {
        invalidateFetchUserCache(user.uid);
    }

    const cached = fetchUserCache.get(user.uid);
    const now = Date.now();
    if (!options.forceFresh && cached && cached.expiresAt > now) {
        return cached.result;
    }

    const inflight = fetchUserInflight.get(user.uid);
    if (inflight) {
        return inflight;
    }

    const requestPromise = (async (): Promise<FetchUserResult> => {
    try {
        const token = await user.getIdToken();
        const response = await fetchFromApi(`/api/users/${user.uid}?t=${Date.now()}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
                'Cache-Control': 'no-cache',
            },
        });

        if (!response.ok) {
            throw new Error(`Sync Error: ${response.status}`);
        }

        const json = await response.json();
        if (json.found) {
            const result = { success: true, data: json.data } as const;
            fetchUserCache.set(user.uid, {
                expiresAt: Date.now() + FETCH_USER_CACHE_TTL_MS,
                result,
            });
            return result;
        } else {
            const result = { success: false, error: 'User not found in cloud', notFound: true } as const;
            fetchUserCache.set(user.uid, {
                expiresAt: Date.now() + 1000,
                result,
            });
            return result;
        }
    } catch (error: any) {
        console.warn('Failed to fetch cloud data:', error);
        return { success: false, error: error.message || 'Unknown error' };
    } finally {
        fetchUserInflight.delete(user.uid);
    }
    })();

    fetchUserInflight.set(user.uid, requestPromise);
    return requestPromise;
}

/**
 * Sanitize object for D1 storage
 * D1 doesn't support 'undefined' values - converts them to null
 */
const sanitizeForD1 = (obj: any): any => {
    if (obj === undefined) return null;
    if (obj === null) return null;
    if (typeof obj !== 'object') return obj;
    if (Array.isArray(obj)) return obj.map(sanitizeForD1);

    const result: Record<string, any> = {};
    for (const [key, value] of Object.entries(obj)) {
        result[key] = sanitizeForD1(value);
    }
    return result;
};

/**
 * Compact state for cloud sync (Hybrid Storage v2.1)
 * Converts heavy arrays (poops, bugs) to lightweight counts
 * 
 * ~98% data reduction for poop/bug storage:
 * - Before: [{id, x, y, createdAt, healthDebuff}, ...] (~150 bytes each)
 * - After: poopCount: 5, bugCounts: { fly: 2, mosquito: 3 } (~30 bytes total)
 */
const compactStateForSync = (state: NurturingPersistentState): any => {
    // Count bugs by type
    const bugCounts: Record<string, number> = {};
    if (state.bugs && state.bugs.length > 0) {
        for (const bug of state.bugs) {
            bugCounts[bug.type] = (bugCounts[bug.type] || 0) + 1;
        }
    }

    // Create compact state
    const compactState: any = {
        ...state,
        // Replace arrays with counts
        poopCount: state.poops?.length || 0,
        bugCounts: Object.keys(bugCounts).length > 0 ? bugCounts : null,
        pendingPoopCount: state.pendingPoops?.length || 0,
        // Explicitly preserve critical non-column fields
        currentHouseId: state.currentHouseId || 'tent',
    };

    // Remove the original arrays (they'll be regenerated on load)
    delete compactState.poops;
    delete compactState.bugs;
    delete compactState.pendingPoops;

    return compactState;
};

const buildSyncPayload = (user: User, state: NurturingPersistentState) => {
    const payload = {
        email: user.email || null,
        display_name: user.displayName || state.characterName || 'Player',
        level: state.evolutionStage || 1,
        xp: state.xp || 0,
        gro: state.gro || 0,
        star: state.totalGameStars || 0,
        current_land: state.currentLand || 'default_ground',
        current_house_id: state.currentHouseId || 'tent',
        inventory: state.inventory || [],
        game_data: JSON.stringify(sanitizeForD1(compactStateForSync(state))),
        created_at: user.metadata.creationTime
            ? new Date(user.metadata.creationTime).getTime()
            : Date.now(),
    };

    return sanitizeForD1(payload);
};

const performSyncRequest = async (
    user: User,
    state: NurturingPersistentState
): Promise<SyncRequestResult> => {
    try {
        const payload = buildSyncPayload(user, state);

        let attempt = 0;
        const MAX_ATTEMPTS = 2;

        while (attempt < MAX_ATTEMPTS) {
            attempt++;
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 15000);

            try {
                const token = await user.getIdToken();
                const response = await fetchFromApi(`/api/users/${user.uid}`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(payload),
                    keepalive: true,
                    signal: controller.signal,
                });

                clearTimeout(timeoutId);

                if (response.status === 429) {
                    let json: any = null;
                    try {
                        json = await response.json();
                    } catch {
                        json = null;
                    }

                    const retryAfterMs = Math.min(
                        parseRetryAfterMs(response, json),
                        MAX_SERVER_RATE_LIMIT_WAIT_MS
                    );
                    console.warn(`☁️ Sync rate-limited. Retrying after ${retryAfterMs}ms.`);
                    return { success: false, retryable: true, retryAfterMs };
                }

                if (!response.ok) {
                    const errorText = await response.text();
                    console.warn(`☁️ Sync attempt ${attempt} failed: ${response.status} ${errorText}`);
                    throw new Error(`Sync Error: ${response.status} - ${errorText}`);
                }

                const json = await response.json();
                if (attempt > 1) {
                    console.log('✅ Sync succeeded on retry!');
                }
                if (json.success) {
                    return { success: true };
                }

                return { success: false, retryable: false };
            } catch (error: any) {
                clearTimeout(timeoutId);

                if (error.name === 'AbortError') {
                    console.warn(`☁️ Sync attempt ${attempt} timed out after 15s`);
                } else {
                    console.warn(`☁️ Sync attempt ${attempt} error:`, error.message);
                }

                if (attempt >= MAX_ATTEMPTS) {
                    console.error('❌ All sync attempts failed.');
                    return { success: false, retryable: false };
                }

                await sleep(1000);
            }
        }

        return { success: false, retryable: false };
    } catch (error: any) {
        console.error('☁️ Sync error details:', error?.message || error);
        return { success: false, retryable: false };
    }
};

const scheduleSyncFlush = (uid: string, delayMs = 0) => {
    const entry = syncQueue.get(uid);
    if (!entry || entry.inFlight) return;

    if (entry.timer) {
        clearTimeout(entry.timer);
    }

    entry.timer = setTimeout(() => {
        entry.timer = null;
        void flushSyncQueue(uid);
    }, Math.max(0, delayMs));
};

const flushSyncQueue = async (uid: string): Promise<void> => {
    const entry = syncQueue.get(uid);
    if (!entry || entry.inFlight || !entry.pendingState) return;

    const now = Date.now();
    const waitMs = Math.max(0, entry.nextAllowedAt - now);
    if (waitMs > 0) {
        scheduleSyncFlush(uid, waitMs);
        return;
    }

    const stateToSync = entry.pendingState;
    const batchWaiters = entry.waiters.splice(0);
    entry.pendingState = null;
    entry.inFlight = true;

    const result = await performSyncRequest(entry.user, stateToSync);

    entry.inFlight = false;

    if (result.success) {
        const completedAt = Date.now();
        entry.lastAttemptAt = completedAt;
        entry.nextAllowedAt = completedAt + CLIENT_SYNC_COOLDOWN_MS;
        invalidateFetchUserCache(uid);
        resolveWaiters(batchWaiters, true);
    } else if (result.retryable) {
        entry.pendingState = entry.pendingState || stateToSync;
        entry.waiters = batchWaiters.concat(entry.waiters);
        entry.nextAllowedAt = Date.now() + Math.max(result.retryAfterMs || CLIENT_SYNC_COOLDOWN_MS, CLIENT_SYNC_COOLDOWN_MS);
        scheduleSyncFlush(uid, entry.nextAllowedAt - Date.now());
        return;
    } else {
        resolveWaiters(batchWaiters, false);
    }

    if (entry.pendingState) {
        scheduleSyncFlush(uid, Math.max(0, entry.nextAllowedAt - Date.now()));
        return;
    }

    if (!entry.inFlight && entry.waiters.length === 0) {
        syncQueue.delete(uid);
    }
};

const enqueueSync = (user: User, state: NurturingPersistentState): Promise<boolean> => {
    const existingEntry = syncQueue.get(user.uid);
    const entry: SyncQueueEntry = existingEntry || {
        inFlight: false,
        lastAttemptAt: 0,
        nextAllowedAt: 0,
        pendingState: null,
        waiters: [],
        timer: null,
        user,
    };

    entry.user = user;
    entry.pendingState = state;
    syncQueue.set(user.uid, entry);

    return new Promise((resolve) => {
        entry.waiters.push(resolve);
        scheduleSyncFlush(user.uid, 0);
    });
};


export interface XsollaCheckoutRequest {
    productId: BillingProductId;
    countryCode?: string | null;
    languageCode?: string | null;
    email?: string | null;
    name?: string | null;
}

export interface XsollaCheckoutResponse {
    success: boolean;
    productId?: BillingProductId;
    token?: string;
    orderId?: string | null;
    checkoutUrl?: string;
    sandbox?: boolean;
    identifierType?: 'plan_id' | 'sku';
    error?: string;
    details?: unknown;
}

export type CancelSubscriptionResult =
    | { success: true }
    | {
        success: false;
        reason: 'xsolla_managed' | 'request_failed';
        message?: string;
        subscriptionPlan?: string | null;
    };

/**
 * Create Xsolla checkout token
 * Calls the dedicated checkout-token endpoint and returns the hosted checkout URL.
 */
export const purchaseSubscription = async (
    user: User,
    payload: XsollaCheckoutRequest
): Promise<XsollaCheckoutResponse> => {
    try {
        const token = await user.getIdToken();
        const response = await fetchFromApi(`/api/users/${user.uid}/xsolla/checkout-token`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        });

        if (!response.ok) {
            const json = await response.json().catch(() => null);
            throw new Error(json?.error || `Checkout Error: ${response.status}`);
        }

        const json = await response.json();
        return json;
    } catch (error: any) {
        console.error('Purchase failed:', error);
        return {
            success: false,
            error: error?.message || 'Unknown error',
        };
    }
};

/**
 * Cancel Subscription
 * Calls the dedicated cancel endpoint to revoke premium status
 */
export const cancelSubscription = async (
    user: User
): Promise<CancelSubscriptionResult> => {
    try {
        const token = await user.getIdToken();
        const response = await fetchFromApi(`/api/users/${user.uid}/cancel`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            const json = await response.json().catch(() => null);
            if (response.status === 409) {
                return {
                    success: false,
                    reason: 'xsolla_managed',
                    message: json?.error || 'Cancel through Xsolla and wait for the verified webhook.',
                    subscriptionPlan: json?.subscriptionPlan || null,
                };
            }

            const text = json ? JSON.stringify(json) : await response.text();
            throw new Error(text);
        }

        const json = await response.json();
        invalidateFetchUserCache(user.uid);
        return json;
    } catch (error: any) {
        console.error('Cancellation failed:', error);
        return {
            success: false,
            reason: 'request_failed',
            message: error?.message || 'Unknown error',
        };
    }
};

export type ClaimDailyRoutineResult =
    | { success: true; reward: DailyRoutineReward; claimedAt: number }
    | { success: false; error: string; alreadyClaimed?: boolean };

export const claimDailyRoutineReward = async (
    user: User,
    dateKey: string
): Promise<ClaimDailyRoutineResult> => {
    try {
        const token = await user.getIdToken();
        const response = await fetchFromApi(`/api/users/${user.uid}/daily-routine-claim`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ dateKey, date_key: dateKey }),
        });

        const json = await response.json();

        if (response.status === 409) {
            return {
                success: false,
                error: json.error || 'Already claimed',
                alreadyClaimed: true,
            };
        }

        if (!response.ok) {
            return {
                success: false,
                error: json.error || `Claim Error: ${response.status}`,
            };
        }

        invalidateFetchUserCache(user.uid);
        return {
            success: true,
            reward: json.reward,
            claimedAt: json.claimedAt,
        };
    } catch (error: any) {
        return {
            success: false,
            error: error.message || 'Unknown error',
        };
    }
};

/**
 * Sync (Upsert) user data to Cloudflare D1
 * 
 * HYBRID STORAGE ARCHITECTURE:
 * - game_data (JSON string): Contains FULL game state - this is the source of truth
 * - Individual columns (level, xp, gro, etc.): For D1 dashboard/statistics queries only
 * 
 * On sync: We send both, but game_data is what gets restored on login
 */
/**
 * Migrate Guest Data to Cloud (Phase 2)
 * Uploads local guest data to the new user's cloud storage
 */
export const migrateGuestToCloud = async (user: User, guestData: NurturingPersistentState): Promise<boolean> => {
    try {


        // syncUserData handles compaction internally
        // We assume guestData is the "latest" truth to overwrite cloud state

        const success = await syncUserData(user, guestData);

        if (success) {

            return true;
        } else {
            console.error('❌ [Migration] Failed to migrate');
            return false;
        }
    } catch (e) {
        console.error('❌ [Migration] Exception during migration:', e);
        return false;
    }
};

export const syncUserData = async (
    user: User,
    state: NurturingPersistentState
): Promise<boolean> => {
    return enqueueSync(user, state);
};
