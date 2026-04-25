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
    isAdmin: boolean;
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

const getAdminEmailAllowlist = (): string[] => {
    const raw = import.meta.env.VITE_ADMIN_EMAILS;

    if (typeof raw !== 'string') {
        return [];
    }

    return raw
        .split(',')
        .map((email) => email.trim().toLowerCase())
        .filter(Boolean);
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const isPremiumSessionGuardEnabled = import.meta.env.VITE_ENABLE_PREMIUM_SESSION_GUARD === 'true';
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
    const [isAdmin, setIsAdmin] = useState(false);

    // Removed redundant useEffect for guestId loading
    // useEffect(() => { ... }, []);

    useEffect(() => {
        console.log('[Auth] subscribe onAuthStateChanged', {
            isGuestInitial: isGuest,
            guestIdInitial: guestId,
            sessionGuardEnabled: isPremiumSessionGuardEnabled,
        });

        const unsubscribe = onAuthStateChanged(
            auth,
            (currentUser) => {
                console.log('[Auth] onAuthStateChanged', {
                    uid: currentUser?.uid ?? null,
                    email: currentUser?.email ?? null,
                    isGuestBeforeUpdate: isGuest,
                    guestId,
                });
                setUser(currentUser);
                const adminEmails = getAdminEmailAllowlist();
                const normalizedEmail = currentUser?.email?.toLowerCase() ?? '';

                setIsAdmin(Boolean(normalizedEmail && adminEmails.includes(normalizedEmail)));

                if (currentUser) {
                    // If logged in, we are NOT a guest. Clear guest flag.
                    setIsGuest(false);
                    safeStorageRemove('puzzleletic_is_guest_active');
                } else {
                    setIsAdmin(false);
                }
                // If no user, isGuest state persists from localStorage initialization
                setLoading(false);
                console.log('[Auth] state settled', {
                    uid: currentUser?.uid ?? null,
                    isGuestAfterSettle: currentUser ? false : isGuest,
                    guestId,
                });
            },
            (error) => {
                console.error('[Auth] onAuthStateChanged error:', error);
                setLoading(false);
            }
        );

        return () => {
            console.log('[Auth] unsubscribe onAuthStateChanged');
            unsubscribe();
        };
    }, [guestId, isGuest, isPremiumSessionGuardEnabled]);

    // Duplicate Login Prevention (Session Management) - PREMIUM ONLY
    useEffect(() => {
        if (!user || !isPremiumSessionGuardEnabled) {
            if (user && !isPremiumSessionGuardEnabled) {
                console.log('[SessionGuard] skipped because feature flag is disabled', {
                    uid: user.uid,
                });
            }
            return;
        }

        let unsubscribeSession: (() => void) | undefined;
        let isActive = true;

        const initPremiumSession = async () => {
            try {
                console.log('[SessionGuard] init start', { uid: user.uid });
                const result = await fetchUserData(user);
                if (!isActive) return;

                if (!result.success || !result.data) return;

                const entitlementEndRaw = result.data.entitlement_end;
                const entitlementEnd =
                    typeof entitlementEndRaw === 'string'
                        ? Number(entitlementEndRaw)
                        : entitlementEndRaw;
                const isPremium =
                    (result.data.entitlement_status === 'active' ||
                        result.data.entitlement_status === 'non_renewing') &&
                    typeof entitlementEnd === 'number' &&
                    Number.isFinite(entitlementEnd) &&
                    entitlementEnd > Date.now();

                if (!isPremium) return;

                // Premium user: Enable duplicate login protection
                const userSessionRef = ref(database, `users/${user.uid}/session`);
                const currentSessionId = `${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;
                let hasSeenCurrentSession = false;

                console.log('[SessionGuard] enabling RTDB session watch', {
                    uid: user.uid,
                    currentSessionId,
                });

                await set(userSessionRef, {
                    id: currentSessionId,
                    lastActive: Date.now(),
                    deviceInfo: navigator.userAgent.slice(0, 100) // Limit size
                });
                if (!isActive) return;

                unsubscribeSession = onValue(userSessionRef, (snapshot) => {
                    if (!isActive) return;

                    const data = snapshot.val();
                    console.log('[SessionGuard] session snapshot', {
                        uid: user.uid,
                        currentSessionId,
                        seenOwnSession: hasSeenCurrentSession,
                        remoteSessionId: data?.id ?? null,
                    });
                    if (data?.id === currentSessionId) {
                        hasSeenCurrentSession = true;
                        return;
                    }

                    if (hasSeenCurrentSession && data?.id && data.id !== currentSessionId) {
                        console.warn('[SessionGuard] signing out due to different session id', {
                            uid: user.uid,
                            currentSessionId,
                            remoteSessionId: data.id,
                        });
                        firebaseSignOut(auth); // Silent logout
                    }
                });
            } catch (error) {
                // Keep UX non-blocking, but expose diagnostics for session guard issues.
                console.warn('[SessionGuard] Failed to initialize premium session protection:', error);
            }
        };

        initPremiumSession();

        return () => {
            isActive = false;
            console.log('[SessionGuard] cleanup', { uid: user.uid });
            unsubscribeSession?.();
        };
    }, [user?.uid, isPremiumSessionGuardEnabled]);

    const loginAsGuest = () => {
        let id = safeStorageGet('puzzleletic_guest_id');
        if (!id) {
            id = `guest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            safeStorageSet('puzzleletic_guest_id', id);
        }
        setGuestId(id);
        setIsGuest(true);
        safeStorageSet('puzzleletic_is_guest_active', 'true');
        console.log('[Auth] loginAsGuest', { guestId: id });
    };

    const logout = async () => {
        console.log('[Auth] logout requested', {
            uid: auth.currentUser?.uid ?? null,
            guestId,
            isGuest,
        });
        await firebaseSignOut(auth);
        setIsGuest(false); // Reset guest state on logout
        setIsAdmin(false);
        safeStorageRemove('puzzleletic_is_guest_active');
    };

    return (
        <AuthContext.Provider value={{ user, loading, logout, isGuest, guestId, loginAsGuest, isAdmin }}>
            {children}
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
