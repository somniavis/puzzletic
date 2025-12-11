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
    glo: number;
    inventory: string[];
    created_at: number;
    last_synced_at: number;
}

/**
 * Fetch user data from Cloudflare
 */
export const fetchUserData = async (user: User): Promise<CloudUserData | null> => {
    try {
        const token = await user.getIdToken();
        const response = await fetch(`${API_BASE_URL}/api/users/${user.uid}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error(`Sync Error: ${response.status}`);
        }

        const json = await response.json();
        return json.found ? json.data : null;
    } catch (error) {
        console.warn('Failed to fetch cloud data:', error);
        return null;
    }
};

/**
 * Sync (Upsert) user data to Cloudflare
 * triggers on core data changes (XP, Glo, Inventory)
 */
export const syncUserData = async (
    user: User,
    state: NurturingPersistentState
): Promise<boolean> => {
    try {
        const token = await user.getIdToken();

        // Extract only core data
        const payload = {
            email: user.email,
            displayName: user.displayName,
            level: state.evolutionStage || 1,
            xp: state.xp || 0,
            glo: state.glo || 0,
            inventory: state.inventory || [],
            createdAt: user.metadata.creationTime ? new Date(user.metadata.creationTime).getTime() : Date.now(),
        };

        const response = await fetch(`${API_BASE_URL}/api/users/${user.uid}`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        });

        if (!response.ok) {
            throw new Error(`Sync Error: ${response.status}`);
        }

        const json = await response.json();
        return json.success;
    } catch (error) {
        console.warn('Failed to sync cloud data:', error);
        return false;
    }
};
