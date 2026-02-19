import React from 'react';
import { useTranslation, Trans } from 'react-i18next';
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

    const handleAction = () => {
        playButtonSound();
        onSignup();
        navigate('/signup', { state: { from: '/room' } });
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
                position: 'relative', // For absolute positioning of close button
                maxWidth: '320px',
                padding: '24px',
                paddingTop: '40px', // Extra space for close button
                textAlign: 'center',
                animation: 'popIn 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
            }}>
                {/* Close Button (Matches App Style) */}
                <button
                    onClick={() => { playButtonSound(); onClose(); }}
                    style={{
                        position: 'absolute',
                        top: '12px',
                        right: '12px',
                        background: 'transparent',
                        border: '3px solid #4d3e2f',
                        borderRadius: '12px',
                        width: '40px',
                        height: '40px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        fontSize: '1.5rem',
                        color: '#4d3e2f', // Dark Brown for visibility on white
                        boxShadow: '0 3px 0 rgba(0, 0, 0, 0.1)',
                        transition: 'all 0.2s ease',
                        padding: 0,
                        lineHeight: 1
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'scale(1.05)';
                        e.currentTarget.style.backgroundColor = 'rgba(77, 62, 47, 0.05)';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'scale(1)';
                        e.currentTarget.style.backgroundColor = 'transparent';
                    }}
                    onMouseDown={(e) => {
                        e.currentTarget.style.transform = 'translateY(2px) scale(1.05)';
                        e.currentTarget.style.boxShadow = '0 1px 0 rgba(0, 0, 0, 0.1)';
                    }}
                    onMouseUp={(e) => {
                        e.currentTarget.style.transform = 'scale(1.05)';
                        e.currentTarget.style.boxShadow = '0 3px 0 rgba(0, 0, 0, 0.1)';
                    }}
                >
                    ✕
                </button>

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
                    <Trans
                        i18nKey="auth.promo.desc"
                        defaults="To evolve to Stage 2, you need to save your progress. <highlight>Sign up now</highlight> to keep your Jello safe forever!"
                        components={{
                            highlight: <span style={{
                                backgroundColor: '#FFFACD', // LemonChiffon
                                padding: '2px 6px',
                                borderRadius: '6px',
                                border: '1px solid #F0E68C', // Khaki
                                color: '#8B4513', // SaddleBrown
                                fontWeight: 'bold'
                            }} />
                        }}
                    />
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <button
                        className="auth-btn auth-btn--primary"
                        onClick={handleAction}
                        style={{ width: '100%' }}
                    >
                        Jello Save
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
