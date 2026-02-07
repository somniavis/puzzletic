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

    // Duplicate Login Prevention (Session Management)
    useEffect(() => {
        if (!user) return;

        const userSessionRef = ref(database, `users/${user.uid}/session`);
        // Generate a unique session ID for this instance
        const currentSessionId = Date.now().toString() + Math.random().toString(36).substr(2, 9);

        // 1. Register this session in Firebase
        set(userSessionRef, {
            id: currentSessionId,
            lastActive: Date.now(),
            deviceInfo: navigator.userAgent
        }).catch(err => console.error("Session set error:", err));

        // 2. Monitor for changes (Remote Session ID)
        const unsubscribe = onValue(userSessionRef, (snapshot) => {
            const data = snapshot.val();

            // If ID in DB is different from our local ID -> Another device logged in
            if (data && data.id && data.id !== currentSessionId) {
                logout(); // Logout this device silently
            }
        });

        return () => {
            unsubscribe();
        };
    }, [user?.uid]); // Re-run only if UID changes (login/switch user)

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
