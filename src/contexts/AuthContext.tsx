import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, signOut as firebaseSignOut } from 'firebase/auth';
import { ref, set, onValue } from 'firebase/database';
import type { User } from 'firebase/auth';
import { auth, database } from '../firebase';

interface AuthContextType {
    user: User | null;
    loading: boolean;
    logout: () => Promise<void>;
    isGuest: boolean;
    guestId: string | null;
    loginAsGuest: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    // Initialize isGuest synchronously from localStorage to persist session on refresh
    const [isGuest, setIsGuest] = useState(() => {
        return localStorage.getItem('puzzleletic_is_guest_active') === 'true';
    });

    // Initialize Guest ID synchronously to prevent race conditions in NurturingContext
    const [guestId, setGuestId] = useState<string | null>(() => {
        return localStorage.getItem('puzzleletic_guest_id');
    });

    // Removed redundant useEffect for guestId loading
    // useEffect(() => { ... }, []);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
            if (currentUser) {
                // If logged in, we are NOT a guest. Clear guest flag.
                setIsGuest(false);
                localStorage.removeItem('puzzleletic_is_guest_active');
            }
            // If no user, isGuest state persists from localStorage initialization
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    // Duplicate Login Prevention (Session Management) - PREMIUM ONLY
    useEffect(() => {
        if (!user) return;

        let unsubscribeSession: (() => void) | undefined;

        const initPremiumSession = async () => {
            try {
                const { fetchUserData } = await import('../services/syncService');
                const result = await fetchUserData(user);

                if (!result.success || !result.data) return;

                const { is_premium, subscription_end } = result.data;
                const isPremium = is_premium === 1 ||
                    (subscription_end != null && subscription_end > Date.now());

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
            } catch {
                // Silently fail - don't block user experience
            }
        };

        initPremiumSession();

        return () => unsubscribeSession?.();
    }, [user?.uid]);

    const loginAsGuest = () => {
        let id = localStorage.getItem('puzzleletic_guest_id');
        if (!id) {
            id = `guest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            localStorage.setItem('puzzleletic_guest_id', id);
        }
        setGuestId(id);
        setIsGuest(true);
        localStorage.setItem('puzzleletic_is_guest_active', 'true');
    };

    const logout = async () => {
        await firebaseSignOut(auth);
        setIsGuest(false); // Reset guest state on logout
        localStorage.removeItem('puzzleletic_is_guest_active');
    };

    return (
        <AuthContext.Provider value={{ user, loading, logout, isGuest, guestId, loginAsGuest }}>
            {!loading && children}
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
