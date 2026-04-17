import React, { useState } from 'react';
import './Auth.css';
import { playButtonSound } from '../utils/sound';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext'; // Import useAuth
import { useMobileInteractionGuard } from '../hooks/useMobileInteractionGuard';
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
    const rootRef = React.useRef<HTMLDivElement | null>(null);
    const [errors, setErrors] = useState<{
        email?: string;
        password?: string;
        general?: string;
    }>({});

    useMobileInteractionGuard({ rootRef, blockSelection: false });

    // Handle Redirect Result (for Mobile/Tablet flow)
    React.useEffect(() => {
        const checkRedirect = async () => {
            try {
                const result = await getRedirectResult(auth);
                if (result) {
                    console.log('[LoginPage] getRedirectResult success', {
                        uid: result.user?.uid ?? null,
                        email: result.user?.email ?? null,
                    });
                    playButtonSound();
                    console.log('[LoginPage] navigate -> /home from redirect result');
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
        console.log('[LoginPage] handleLogin submit', {
            email,
            passwordLength: password.length,
        });
        try {
            const credential = await signInWithEmailAndPassword(auth, email, password);
            console.log('[LoginPage] signInWithEmailAndPassword success', {
                uid: credential.user?.uid ?? null,
                email: credential.user?.email ?? null,
            });
            console.log('[LoginPage] navigate -> /home from email login');
            navigate('/home');
        } catch (error: any) {
            console.error('Login failed:', error);
            if (error.code === 'auth/invalid-credential' || error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
                setErrors({ password: t('auth.errors.invalidCredential') });
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
        setErrors({});
        console.log('[LoginPage] handleGoogleLogin start');

        try {
            const credential = await signInWithPopup(auth, googleProvider);
            console.log('[LoginPage] signInWithPopup success', {
                uid: credential.user?.uid ?? null,
                email: credential.user?.email ?? null,
            });
            console.log('[LoginPage] navigate -> /home from google popup');
            navigate('/home');
        } catch (error: any) {
            const shouldFallbackToRedirect =
                error?.code === 'auth/popup-blocked' ||
                error?.code === 'auth/cancelled-popup-request' ||
                error?.code === 'auth/operation-not-supported-in-this-environment';

            console.warn('[LoginPage] google login fallback check', {
                code: error?.code ?? null,
                shouldFallbackToRedirect,
            });

            if (shouldFallbackToRedirect) {
                try {
                    setIsRedirecting(true);
                    console.log('[LoginPage] signInWithRedirect start');
                    await signInWithRedirect(auth, googleProvider);
                    return;
                } catch (redirectError: any) {
                    console.error('Google Login (Redirect fallback) failed:', redirectError);
                    setIsRedirecting(false);
                    setErrors({ general: t('auth.errors.googleFailed') });
                    return;
                }
            }

            console.error('Google Login failed:', error);
            setIsRedirecting(false);
            if (error.code !== 'auth/popup-closed-by-user') {
                setErrors({ general: t('auth.errors.googleFailed') });
            }
        }
    };



    const handleGoToSignup = () => {
        playButtonSound();
        console.log('[LoginPage] navigate -> /signup');
        navigate('/signup');
    };



    return (
        <div ref={rootRef} className="auth-page auth-page--login mobile-ui-guard">
            <div className="auth-page__decor" aria-hidden="true">
                <div className="auth-page__aurora auth-page__aurora--left" />
                <div className="auth-page__aurora auth-page__aurora--right" />
                <div className="auth-page__math-layer">
                    <div className="auth-page__math auth-page__math--a">+</div>
                    <div className="auth-page__math auth-page__math--b">−</div>
                    <div className="auth-page__math auth-page__math--c">×</div>
                    <div className="auth-page__math auth-page__math--d">÷</div>
                    <div className="auth-page__math auth-page__math--e">+</div>
                    <div className="auth-page__math auth-page__math--f">×</div>
                </div>
            </div>

            <div className="auth-container auth-container--login">
                <button
                    className="back-btn auth-login__back-btn"
                    onClick={() => {
                        const from = (location.state as any)?.from;
                        if (from) {
                            navigate(from);
                        } else {
                            navigate('/');
                        }
                    }}
                    aria-label={t('common.close')}
                >
                    ←
                </button>

                <header className="auth-header auth-header--login">
                    <h1>{t('auth.login.title')}</h1>
                    <p>{t('auth.login.subtitle')}</p>
                </header>

                <form className="auth-form auth-form--login" onSubmit={handleLogin}>
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
                            }}
                            aria-invalid={Boolean(errors.password)}
                            required
                        />
                        {errors.password && <p className="form-error">{errors.password}</p>}
                    </div>

                    <button type="submit" className="auth-btn auth-btn--primary" disabled={loading} style={{ width: '100%' }}>
                        {loading ? t('auth.logging_in') : t('auth.login.action')}
                    </button>
                    {errors.general && <p className="form-error form-error--general">{errors.general}</p>}
                </form>

                <div className="auth-divider auth-divider--login">{t('auth.login.or')}</div>

                <div className="auth-login__actions">
                    <button
                        type="button"
                        className="auth-btn auth-btn--google"
                        onClick={handleGoogleLogin}
                        disabled={isRedirecting}
                    >
                        {isRedirecting ? (
                            <span>{t('common.loading')}</span>
                        ) : (
                            <>
                                <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt={t('auth.googleLogoAlt')} style={{ width: '18px', height: '18px' }} />
                                {t('auth.login.google')}
                            </>
                        )}
                    </button>
                </div>

                <div className="auth-login__footer-link">
                    <span>{t('auth.login.needAccount')}</span>
                    <button
                        type="button"
                        className="auth-link-btn auth-link-btn--inline"
                        onClick={handleGoToSignup}
                    >
                        {t('auth.login.signup')}
                    </button>
                </div>
            </div>
        </div>
    );
};
