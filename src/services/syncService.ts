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
};

/**
 * Sanitize payload for D1 compatibility
 * Replaces undefined with null
 * Ensures numeric values are finite
 */
const sanitizePayload = (data: any): any => {
    if (data === undefined) return null;
    if (data === null) return null;
    if (typeof data === 'number') {
        return Number.isFinite(data) ? data : 0;
    }
    if (Array.isArray(data)) {
        return data.map(item => sanitizePayload(item));
    }
    if (typeof data === 'object') {
        const sanitized: any = {};
        for (const [key, value] of Object.entries(data)) {
            sanitized[key] = sanitizePayload(value);
        }
        return sanitized;
    }
    return data;
};

/**
 * Sync (Upsert) user data to Cloudflare
 * triggers on core data changes (XP, Gro, Inventory)
 */
export const syncUserData = async (
    user: User,
    state: NurturingPersistentState
): Promise<boolean> => {
    try {
        const token = await user.getIdToken();

        // Prepare payload with snake_case for D1
        // We stringify game_data here to ensure strict storage as string if needed,
        // or passing as object if backend handles it.
        // Based on typical D1 setups, sending structured JSON is better, but let's match the interface hints.
        // Let's stick to the previous robust approach: camelCase keys might be failing if backend expects snake_case.

        const rawPayload = {
            // Common Fields
            email: user.email,
            xp: state.xp || 0,
            gro: state.gro || 0,
            inventory: state.inventory || [],

            // Snake_case (D1 Standard)
            display_name: user.displayName,
            level: state.evolutionStage || 1,
            current_land: state.currentLand || 'default_ground',
            game_data: JSON.stringify(state),
            created_at: user.metadata.creationTime ? new Date(user.metadata.creationTime).getTime() : Date.now(),

            // CamelCase (Legacy/Fallback Support)
            displayName: user.displayName,
            currentLand: state.currentLand,
            gameData: state,
            createdAt: user.metadata.creationTime ? new Date(user.metadata.creationTime).getTime() : Date.now(),
        };

        const payload = sanitizePayload(rawPayload);

        const response = await fetch(`${API_BASE_URL}/api/users/${user.uid}`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
            keepalive: true, // Allow request to complete even if tab closes
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Sync Error: ${response.status} - ${errorText}`);
        }

        const json = await response.json();
        return json.success;
    } catch (error) {
        console.warn('Failed to sync cloud data:', error);
        return false;
    }
};
