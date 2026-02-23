import React, { useState } from 'react';
import './Auth.css';
import { playButtonSound } from '../utils/sound';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext'; // Import useAuth
import { auth, googleProvider } from '../firebase';
import { signInWithEmailAndPassword, signInWithPopup, signInWithRedirect, getRedirectResult } from 'firebase/auth';

import { useNavigate, useLocation } from 'react-router-dom';

// interface LoginPageProps removed as it's no longer needed (or empty)
export const LoginPage: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { t } = useTranslation();
    const { loading } = useAuth(); // Destructure loading from context
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isRedirecting, setIsRedirecting] = useState(false);
    const [showSignupHint, setShowSignupHint] = useState(false);
    const [errors, setErrors] = useState<{
        email?: string;
        password?: string;
        general?: string;
    }>({});

    // Handle Redirect Result (for Mobile/Tablet flow)
    React.useEffect(() => {
        const checkRedirect = async () => {
            try {
                const result = await getRedirectResult(auth);
                if (result) {

                    playButtonSound();
                    navigate('/home');
                }
            } catch (error: any) {
                console.error('Google Login (Redirect) failed:', error);
                setErrors({ general: t('auth.errors.googleFailed') });
            }
        };
        checkRedirect();
    }, [navigate, t]);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        playButtonSound();
        setErrors({});
        setShowSignupHint(false);

        try {
            await signInWithEmailAndPassword(auth, email, password);

            navigate('/home');
        } catch (error: any) {
            console.error('Login failed:', error);
            if (error.code === 'auth/invalid-credential' || error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
                setErrors({ password: t('auth.errors.invalidCredential') });
                setShowSignupHint(true);
                return;
            }

            if (error.code === 'auth/invalid-email') {
                setErrors({ email: t('auth.errors.invalidEmail') });
                return;
            }

            if (error.code === 'auth/too-many-requests') {
                setErrors({ general: t('auth.errors.tooManyRequests') });
                return;
            }

            setErrors({ general: t('auth.errors.default') });
        }
    };

    const handleGoogleLogin = async () => {
        playButtonSound();

        // Detect Mobile/Tablet
        const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

        try {
            if (isMobile) {
                // Use Redirect for Mobile/Tablet to avoid popup blockers and context loss
                setIsRedirecting(true); // Optional: show loading state
                await signInWithRedirect(auth, googleProvider);
                // Page will redirect, so no navigation needed here
            } else {
                // Use Popup for Desktop
                await signInWithPopup(auth, googleProvider);

                navigate('/home');
            }
        } catch (error: any) {
            console.error('Google Login failed:', error);
            setIsRedirecting(false);
            if (error.code !== 'auth/popup-closed-by-user') {
                setErrors({ general: t('auth.errors.googleFailed') });
            }
        }
    };



    const handleGoToSignup = () => {
        playButtonSound();
        navigate('/signup');
    };



    return (
        <div className="auth-page">
            <div className="auth-container">
                <header className="auth-header" style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '16px',
                    textAlign: 'left'
                }}>
                    <div>
                        <h1 style={{ margin: 0, fontSize: '1.8rem', lineHeight: '1.2' }}>{t('auth.login.title')}</h1>
                        <p style={{ margin: '4px 0 0 0', fontSize: '0.9rem', opacity: 0.9 }}>{t('auth.login.subtitle')}</p>
                    </div>


                    <button
                        className="back-btn"
                        onClick={() => {
                            const from = (location.state as any)?.from;
                            if (from) {
                                navigate(from);
                            } else {
                                navigate('/');
                            }
                        }}
                        aria-label={t('common.close')}
                        style={{
                            width: '42px',
                            height: '42px',
                            fontSize: '1.5rem',
                            flexShrink: 0,
                            paddingBottom: '4px',
                            backgroundColor: '#8B4513', // Explicit Brown background
                            color: '#FFFFFF', // White text
                            border: '2px solid #5e2f0d'
                        }}
                    >
                        ←
                    </button>
                </header>

                <form className="auth-form" onSubmit={handleLogin}>
                    <div className="form-group">
                        <label className="form-label">{t('auth.login.email')}</label>
                        <input
                            type="email"
                            className={`form-input ${errors.email ? 'form-input--error' : ''}`}
                            placeholder={t('auth.login.emailPlaceholder')}
                            value={email}
                            onChange={(e) => {
                                setEmail(e.target.value);
                                if (errors.email || errors.general) {
                                    setErrors(prev => ({ ...prev, email: undefined, general: undefined }));
                                }
                                setShowSignupHint(false);
                            }}
                            aria-invalid={Boolean(errors.email)}
                            required
                        />
                        {errors.email && <p className="form-error">{errors.email}</p>}
                    </div>

                    <div className="form-group">
                        <label className="form-label">{t('auth.login.password')}</label>
                        <input
                            type="password"
                            className={`form-input ${errors.password ? 'form-input--error' : ''}`}
                            placeholder={t('auth.login.passwordPlaceholder')}
                            value={password}
                            onChange={(e) => {
                                setPassword(e.target.value);
                                if (errors.password || errors.general) {
                                    setErrors(prev => ({ ...prev, password: undefined, general: undefined }));
                                }
                                setShowSignupHint(false);
                            }}
                            aria-invalid={Boolean(errors.password)}
                            required
                        />
                        {errors.password && <p className="form-error">{errors.password}</p>}
                        {showSignupHint && (
                            <button
                                type="button"
                                className="form-inline-link"
                                onClick={handleGoToSignup}
                            >
                                {t('auth.login.signup')}
                            </button>
                        )}
                    </div>

                    <button type="submit" className="auth-btn auth-btn--primary" disabled={loading} style={{ width: '100%' }}>
                        {loading ? t('auth.logging_in') : t('auth.login.action')}
                    </button>
                    {errors.general && <p className="form-error form-error--general">{errors.general}</p>}
                </form>

                <div className="auth-divider">{t('auth.login.or')}</div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <button
                        type="button"
                        className="auth-btn"
                        onClick={handleGoogleLogin}
                        disabled={isRedirecting}
                        style={{
                            backgroundColor: isRedirecting ? '#f5f5f5' : '#ffffff',
                            color: isRedirecting ? '#9e9e9e' : '#757575',
                            border: '1px solid #ddd',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px',
                            fontSize: '15px',
                            width: '100%',
                            height: '56px',
                            boxSizing: 'border-box',
                            cursor: isRedirecting ? 'not-allowed' : 'pointer'
                        }}
                    >
                        {isRedirecting ? (
                            <span>Loading...</span>
                        ) : (
                            <>
                                <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" style={{ width: '18px', height: '18px' }} />
                                {t('auth.login.google')}
                            </>
                        )}
                    </button>

                    {/* 
                    <button 
                        type="button" 
                        className="auth-btn auth-btn--apple"
                        onClick={handleAppleLogin}
                        style={{ backgroundColor: '#000000', color: '#ffffff', border: '1px solid #000', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                    >
                        <span style={{ fontSize: '18px' }}></span>
                        Sign in with Apple
                    </button> 
                    */}

                    <button
                        className="auth-btn"
                        onClick={handleGoToSignup}
                        style={{
                            backgroundColor: '#FFD700', /* Stronger Gold */
                            color: '#4d3e2f',
                            border: '1px solid #d4961f',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px',
                            fontSize: '15px',
                            width: '100%',
                            height: '56px',
                            boxSizing: 'border-box'
                        }}
                    >
                        <span style={{ fontSize: '18px' }}>✉️</span>
                        {t('auth.login.signup')}
                    </button>
                </div>
            </div>
        </div>
    );
};
