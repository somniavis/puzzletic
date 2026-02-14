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
                <svg className="nature-bg" viewBox="0 0 1000 500" preserveAspectRatio="xMidYMax slice" aria-hidden="true">
                    <path d="M1000 0 C800 50 600 200 450 350 L1000 500 Z" fill="white" opacity="0.5" />
                    <path d="M0 350 Q150 250 300 350 T600 350 T1000 360 L1000 500 L0 500 Z" fill="#9BCC9A" opacity="0.6" />
                    <path d="M-50 500 L-50 300 C100 250 250 450 400 350 C550 250 650 450 800 500 Z" fill="#30918B" opacity="0.8" />
                    <path d="M0 500 L0 380 C150 320 300 480 550 420 C600 410 650 500 650 500 Z" fill="#1B5E59" />
                    <path d="M0 500 L650 500 C620 450 500 430 300 450 C100 460 0 500 0 500 Z" fill="#AEE7F0" />
                    <g transform="translate(465, 470) scale(0.33)">
                        <path d="M0 0 L100 0 L90 10 L10 10 Z" fill="#9BCC9A" opacity="0.5" />
                        <path d="M50 -10 L100 -5 L50 -90 Z" fill="white" />
                    </g>
                </svg>

                <svg className="corner-frame" viewBox="0 0 1000 1000" preserveAspectRatio="none" aria-hidden="true">
                    <g className="shadow-filter">
                        <path d="M0 0 L220 0 C180 108 108 180 0 250 Z" fill="#1B5E20" opacity="0.9" />
                        <path d="M1000 0 L780 0 C820 108 892 180 1000 250 Z" fill="#004D40" opacity="0.9" />
                        <path d="M0 1000 L0 780 C108 820 180 892 250 1000 Z" fill="#00332E" />
                        <path d="M1000 1000 L1000 780 C892 820 820 892 750 1000 Z" fill="#1B5E20" />
                    </g>
                </svg>

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
                            className="cta-button cta-button--primary cta-button--start-single"
                            onClick={handleStartExperience}
                        >
                            <span className="button-icon">✦</span>
                            <span className="button-text">start now</span>
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
