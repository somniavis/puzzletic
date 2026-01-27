import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { updateProfile } from 'firebase/auth';
import { playButtonSound } from '../utils/sound';
import '../pages/Auth.css'; // Reuse auth styles for modal

interface GiftBoxModalProps {
    onComplete: (nickname: string) => void;
}

export const GiftBoxModal: React.FC<GiftBoxModalProps> = ({ onComplete }) => {
    const { user, isGuest } = useAuth();
    // Removed 'step' state as we go directly to input
    const [nickname, setNickname] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!nickname.trim()) return;

        // Safety check: Must be either logged in OR a guest
        if (!user && !isGuest) return;

        playButtonSound();
        try {
            // Only update Firebase profile if we have a real user
            if (user) {
                await updateProfile(user, { displayName: nickname });
            }
            onComplete(nickname);
        } catch (error) {
            console.error('Failed to update profile:', error);
            // Even if Firebase fails, we should probably let them in locally?
            // But usually we want consistency. For now, let's just alert.
            alert('Could not save nickname. Please try again.');
        }
    };

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundColor: 'rgba(0,0,0,0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            animation: 'fadeIn 0.5s ease-out'
        }}>
            <div className="auth-container" style={{
                maxWidth: '360px',
                padding: '2rem',
                animation: 'popIn 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)' // Bouncy pop-in
            }}>
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div style={{ textAlign: 'center' }}>
                        <h2 style={{ fontSize: '1.4rem', color: '#4d3e2f', margin: 0 }}>Nice to meet you!</h2>
                        {/* Text removed per user request */}
                    </div>

                    <div className="form-group">
                        <input
                            type="text"
                            className="form-input"
                            placeholder="Enter your nickname"
                            value={nickname}
                            onChange={(e) => setNickname(e.target.value)}
                            required
                            autoFocus
                            style={{ textAlign: 'center', fontSize: '1.2rem' }}
                        />
                    </div>

                    <button type="submit" className="auth-btn auth-btn--primary">
                        Start! ✨
                    </button>
                </form>
            </div>
            <style>{`
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                @keyframes popIn {
                    from { opacity: 0; transform: scale(0.8); }
                    to { opacity: 1; transform: scale(1); }
                }
            `}</style>
        </div>
    );
};
