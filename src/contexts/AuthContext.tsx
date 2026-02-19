import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, signOut as firebaseSignOut } from 'firebase/auth';
import { ref, set, onValue } from 'firebase/database';
import type { User } from 'firebase/auth';
import { auth, database } from '../firebase';
import { fetchUserData } from '../services/syncService';

interface AuthContextType {
    user: User | null;
    loading: boolean;
    logout: () => Promise<void>;
    isGuest: boolean;
    guestId: string | null;
    loginAsGuest: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const safeStorageGet = (key: string): string | null => {
    try {
        return localStorage.getItem(key);
    } catch (error) {
        console.warn('[Auth] localStorage.getItem failed:', error);
        return null;
    }
};

const safeStorageSet = (key: string, value: string) => {
    try {
        localStorage.setItem(key, value);
    } catch (error) {
        console.warn('[Auth] localStorage.setItem failed:', error);
    }
};

const safeStorageRemove = (key: string) => {
    try {
        localStorage.removeItem(key);
    } catch (error) {
        console.warn('[Auth] localStorage.removeItem failed:', error);
    }
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    // Initialize isGuest synchronously from localStorage to persist session on refresh
    const [isGuest, setIsGuest] = useState(() => {
        return safeStorageGet('puzzleletic_is_guest_active') === 'true';
    });

    // Initialize Guest ID synchronously to prevent race conditions in NurturingContext
    const [guestId, setGuestId] = useState<string | null>(() => {
        return safeStorageGet('puzzleletic_guest_id');
    });

    // Removed redundant useEffect for guestId loading
    // useEffect(() => { ... }, []);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(
            auth,
            (currentUser) => {
                setUser(currentUser);
                if (currentUser) {
                    // If logged in, we are NOT a guest. Clear guest flag.
                    setIsGuest(false);
                    safeStorageRemove('puzzleletic_is_guest_active');
                }
                // If no user, isGuest state persists from localStorage initialization
                setLoading(false);
            },
            (error) => {
                console.error('[Auth] onAuthStateChanged error:', error);
                setLoading(false);
            }
        );

        return () => unsubscribe();
    }, []);

    // Duplicate Login Prevention (Session Management) - PREMIUM ONLY
    useEffect(() => {
        if (!user) return;

        let unsubscribeSession: (() => void) | undefined;

        const initPremiumSession = async () => {
            try {
                const result = await fetchUserData(user);

                if (!result.success || !result.data) return;

                const { subscription_end } = result.data;
                const premiumRaw = (result.data as { is_premium?: unknown }).is_premium;
                const premiumFlag =
                    premiumRaw === 1 ||
                    premiumRaw === true ||
                    premiumRaw === '1';

                const premiumExpiry =
                    typeof subscription_end === 'string'
                        ? Number(subscription_end)
                        : subscription_end;

                const isPremium =
                    premiumFlag ||
                    (typeof premiumExpiry === 'number' &&
                        Number.isFinite(premiumExpiry) &&
                        premiumExpiry > Date.now());

                if (!isPremium) return;

                // Premium user: Enable duplicate login protection
                const userSessionRef = ref(database, `users/${user.uid}/session`);
                const currentSessionId = `${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;

                await set(userSessionRef, {
                    id: currentSessionId,
                    lastActive: Date.now(),
                    deviceInfo: navigator.userAgent.slice(0, 100) // Limit size
                });

                unsubscribeSession = onValue(userSessionRef, (snapshot) => {
                    const data = snapshot.val();
                    if (data?.id && data.id !== currentSessionId) {
                        firebaseSignOut(auth); // Silent logout
                    }
                });
            } catch (error) {
                // Keep UX non-blocking, but expose diagnostics for session guard issues.
                console.warn('[SessionGuard] Failed to initialize premium session protection:', error);
            }
        };

        initPremiumSession();

        return () => unsubscribeSession?.();
    }, [user?.uid]);

    const loginAsGuest = () => {
        let id = safeStorageGet('puzzleletic_guest_id');
        if (!id) {
            id = `guest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            safeStorageSet('puzzleletic_guest_id', id);
        }
        setGuestId(id);
        setIsGuest(true);
        safeStorageSet('puzzleletic_is_guest_active', 'true');
    };

    const logout = async () => {
        await firebaseSignOut(auth);
        setIsGuest(false); // Reset guest state on logout
        safeStorageRemove('puzzleletic_is_guest_active');
    };

    return (
        <AuthContext.Provider value={{ user, loading, logout, isGuest, guestId, loginAsGuest }}>
            {loading ? (
                <div style={{ minHeight: '100dvh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8fafc', color: '#334155' }}>
                    Loading...
                </div>
            ) : children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
