import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTranslation } from 'react-i18next';
import './LandingPage.css';

export const LandingPage: React.FC = () => {
    const { loginAsGuest, user } = useAuth();
    const navigate = useNavigate();
    const { t } = useTranslation();

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

    return (
        <div className="landing-container">
            <div className="landing-content">
                <div className="landing-jello-preview">
                    {/* Placeholder or bouncing Jello animation */}
                    <div className="jello-silhouette" />
                </div>

                <h1 className="landing-title">{t('landing.title')}</h1>
                <p className="landing-subtitle">{t('landing.subtitle')}</p>

                <button
                    className="cta-button guest-start-button"
                    onClick={handleStartExperience}
                >
                    <span className="button-icon">✨</span>
                    <span className="button-text">{t('landing.start_experience')}</span>
                </button>

                <div className="auth-links">
                    <p className="auth-text">{t('landing.auth_prompt')}</p>
                    <div className="auth-buttons">
                        <button onClick={() => navigate('/login')} className="text-link">
                            {t('landing.login')}
                        </button>
                        <span className="divider">|</span>
                        <button onClick={() => navigate('/signup')} className="text-link">
                            {t('landing.signup')}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
