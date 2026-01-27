import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { playButtonSound } from '../utils/sound';
import '../pages/Auth.css'; // Reuse auth styles

interface SignupPromoModalProps {
    onClose: () => void;
    onSignup: () => void;
}

export const SignupPromoModal: React.FC<SignupPromoModalProps> = ({ onClose, onSignup }) => {
    const { t } = useTranslation();
    const navigate = useNavigate();

    const handleSignup = () => {
        playButtonSound();
        onSignup(); // This should handle the navigation or whatever parent wants
        navigate('/signup', { state: { from: '/room' } });
    };

    const handleLogin = () => {
        playButtonSound();
        navigate('/login', { state: { from: '/room' } });
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
            zIndex: 2000,
            animation: 'fadeIn 0.3s'
        }}>
            <div className="auth-container" style={{
                maxWidth: '320px',
                padding: '24px',
                textAlign: 'center',
                animation: 'popIn 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
            }}>
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🥚 ➡️ 🐣</div>

                <h2 style={{
                    fontSize: '1.5rem',
                    color: '#4d3e2f',
                    marginBottom: '0.5rem',
                    lineHeight: 1.3
                }}>
                    {t('auth.promo.title', 'Save your Jello!')}
                </h2>

                <p style={{
                    fontSize: '1rem',
                    color: '#666',
                    marginBottom: '1.5rem',
                    lineHeight: 1.5
                }}>
                    {t('auth.promo.desc', 'To evolve to Stage 2, you need to save your progress. Sign up now to keep your Jello safe forever!')}
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <button
                        className="auth-btn auth-btn--primary"
                        onClick={handleSignup}
                        style={{ width: '100%' }}
                    >
                        {t('auth.signup.action')}
                    </button>

                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center', justifyContent: 'center' }}>
                        <span style={{ fontSize: '0.9rem', color: '#888' }}>{t('auth.signup.haveAccount')}</span>
                        <button
                            onClick={handleLogin}
                            style={{
                                background: 'none',
                                border: 'none',
                                color: '#8B4513',
                                fontWeight: 'bold',
                                cursor: 'pointer',
                                fontSize: '0.9rem'
                            }}
                        >
                            {t('auth.login.action')}
                        </button>
                    </div>

                    <button
                        onClick={() => { playButtonSound(); onClose(); }}
                        style={{
                            marginTop: '8px',
                            background: 'none',
                            border: 'none',
                            color: '#999',
                            fontSize: '0.9rem',
                            cursor: 'pointer',
                            textDecoration: 'underline'
                        }}
                    >
                        {t('common.cancel', 'Maybe Later')}
                    </button>
                </div>
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
