/**
 * Sync Service
 * Handles data synchronization with Cloudflare Worker
 */

import type { User } from 'firebase/auth';
import type { NurturingPersistentState } from '../types/nurturing';

const API_BASE_URL = 'https://api-grogrojello.grogrojello.workers.dev';

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
}

/**
 * Fetch user data from Cloudflare
 */
export type FetchUserResult =
    | { success: true; data: CloudUserData }
    | { success: false; error: string; notFound?: boolean };

export const fetchUserData = async (user: User): Promise<FetchUserResult> => {
    try {
        const token = await user.getIdToken();
        const response = await fetch(`${API_BASE_URL}/api/users/${user.uid}?t=${Date.now()}`, {
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
            return { success: true, data: json.data };
        } else {
            return { success: false, error: 'User not found in cloud', notFound: true };
        }
    } catch (error: any) {
        console.warn('Failed to fetch cloud data:', error);
        return { success: false, error: error.message || 'Unknown error' };
    }
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
 * Purchase Subscription
 * Calls the dedicated purchase endpoint to process subscription
 */
export const purchaseSubscription = async (
    user: User,
    planId: '3_months' | '12_months'
): Promise<{ success: boolean; is_premium?: number; subscription_end?: number; plan?: string }> => {
    try {
        const token = await user.getIdToken();
        const response = await fetch(`${API_BASE_URL}/api/users/${user.uid}/purchase`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ planId }),
        });

        if (!response.ok) {
            const text = await response.text();
            throw new Error(text);
        }

        const json = await response.json();
        return json;
    } catch (error: any) {
        console.error('Purchase failed:', error);
        return { success: false };
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
export const syncUserData = async (
    user: User,
    state: NurturingPersistentState
): Promise<boolean> => {
    try {
        const token = await user.getIdToken();

        // Prepare payload - clean and simple
        const payload = {
            // User info
            email: user.email,
            display_name: user.displayName || state.characterName || 'Player',

            // Individual columns (for D1 statistics/dashboard)
            level: state.evolutionStage || 1,
            xp: state.xp || 0,
            gro: state.gro || 0,
            current_land: state.currentLand || 'default_ground',
            inventory: state.inventory || [],

            // Full game state (source of truth for restoration)
            // Must sanitize to convert undefined → null (D1 requirement)
            game_data: JSON.stringify(sanitizeForD1(state)),

            // Timestamps
            created_at: user.metadata.creationTime
                ? new Date(user.metadata.creationTime).getTime()
                : Date.now(),
        };

        console.log('☁️ Syncing to cloud...', { level: payload.level, xp: payload.xp, gro: payload.gro });

        // Sanitize entire payload to remove any undefined values
        const sanitizedPayload = sanitizeForD1(payload);

        // Debug: Log the exact payload being sent
        console.log('☁️ Payload being sent:', JSON.stringify(sanitizedPayload, null, 2));

        const response = await fetch(`${API_BASE_URL}/api/users/${user.uid}`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(sanitizedPayload),
            keepalive: true,
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('☁️ Sync failed:', response.status, errorText);
            throw new Error(`Sync Error: ${response.status} - ${errorText}`);
        }

        const json = await response.json();
        console.log('☁️ Sync complete:', json.success ? '✅' : '❌');
        return json.success;
    } catch (error: any) {
        console.error('☁️ Sync error details:', error?.message || error);
        return false;
    }
};

