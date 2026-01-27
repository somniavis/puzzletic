import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, signOut as firebaseSignOut } from 'firebase/auth';
import type { User } from 'firebase/auth';
import { auth } from '../firebase';

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
    const [isGuest, setIsGuest] = useState(false);
    const [guestId, setGuestId] = useState<string | null>(null);

    useEffect(() => {
        // Initialize Guest ID only if needed (lazy init)
        const storedGuestId = localStorage.getItem('puzzleletic_guest_id');
        if (storedGuestId) {
            setGuestId(storedGuestId);
        }
    }, []);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
            if (currentUser) {
                // If logged in, we are NOT a guest
                setIsGuest(false);
            }
            // If no user, we MIGHT be a guest if explicitly set, but checking "isGuest" state is enough
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const loginAsGuest = () => {
        let id = localStorage.getItem('puzzleletic_guest_id');
        if (!id) {
            id = `guest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            localStorage.setItem('puzzleletic_guest_id', id);
        }
        setGuestId(id);
        setIsGuest(true);
    };

    const logout = async () => {
        await firebaseSignOut(auth);
        setIsGuest(false); // Reset guest state on logout
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
