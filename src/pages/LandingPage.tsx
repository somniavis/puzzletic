import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTranslation } from 'react-i18next';
import { loadNurturingState, getStorageKey, getChecksumKey } from '../services/persistenceService';
import './LandingPage.css';

export const LandingPage: React.FC = () => {
    const { loginAsGuest, user, guestId } = useAuth();
    const navigate = useNavigate();
    const { t } = useTranslation();

    // Check if there is an existing guest session with a character
    const [hasActiveSession, setHasActiveSession] = React.useState(false);

    React.useEffect(() => {
        if (guestId) {

            // Load state synchronously (lightweight check) to see if character exists
            try {
                const savedState = loadNurturingState(guestId);


                // We consider 'active session' if they have a character initialized
                // (If they only have empty state, better to start fresh)
                if (savedState && savedState.hasCharacter) {
                    setHasActiveSession(true);
                }
            } catch (e) {
                console.warn('Failed to check guest session:', e);
            }
        } else {

        }
    }, [guestId]);

    // If already logged in, redirect to home
    React.useEffect(() => {
        if (user) {
            navigate('/room');
        }
    }, [user, navigate]);

    const handleStartExperience = () => {
        loginAsGuest();
        navigate('/room');
    };

    const handleNewGame = () => {
        if (window.confirm(t('common.confirm_reset') || 'Are you sure you want to start a new game? Existing data will be lost.')) {
            // 1. Clear old data
            if (guestId) {
                localStorage.removeItem(getStorageKey(guestId));
                localStorage.removeItem(getChecksumKey(guestId));
                localStorage.removeItem('puzzleletic_guest_id');
            }
            // 2. Start fresh (generates new ID)
            loginAsGuest();
            navigate('/room');
        }
    };

    return (
        <div className="landing-container">
            <div className="landing-main">
                <div className="forest-corners" aria-hidden="true">
                    <span className="forest-corner forest-corner--left" />
                    <span className="forest-corner forest-corner--right" />
                </div>

                <div className="landing-content">
                    <div className="landing-jello-preview" aria-hidden="true">
                        <div className="jello-silhouette" />
                    </div>

                    <div className="landing-copy">
                        <h1 className="landing-brand">GroGroJello</h1>
                        <p className="landing-subtitle">{t('landing.subtitle')}</p>
                    </div>

                    {hasActiveSession ? (
                        <div className="guest-options">
                            <button
                                className="cta-button cta-button--primary"
                                onClick={handleStartExperience}
                            >
                                <span className="button-icon">▶</span>
                                <span className="button-text">{t('landing.continue_experience')}</span>
                            </button>

                            <button
                                className="cta-button cta-button--secondary"
                                onClick={handleNewGame}
                            >
                                <span className="button-icon">↻</span>
                                <span className="button-text">{t('landing.new_game')}</span>
                            </button>
                        </div>
                    ) : (
                        <button
                            className="cta-button cta-button--primary"
                            onClick={handleStartExperience}
                        >
                            <span className="button-icon">✦</span>
                            <span className="button-text">{t('landing.start_experience')}</span>
                        </button>
                    )}
                </div>
            </div>

            <div className="auth-dock">
                <div className="auth-links">
                    <p className="auth-text">{t('landing.auth_prompt')}</p>
                    <div className="auth-buttons">
                        <button onClick={() => navigate('/login')} className="text-link">
                            {t('landing.login')}
                        </button>
                        <button onClick={() => navigate('/signup')} className="text-link">
                            {t('landing.signup')}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
