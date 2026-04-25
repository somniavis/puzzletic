import React, { useState } from 'react';
import './Auth.css';
import { playButtonSound } from '../utils/sound';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext'; // Import useAuth
import { useMobileInteractionGuard } from '../hooks/useMobileInteractionGuard';
import { auth, googleProvider } from '../firebase';
import { createUserWithEmailAndPassword, getRedirectResult, signInWithPopup, signInWithRedirect } from 'firebase/auth';
import { loadNurturingState, saveNurturingState, getStorageKey } from '../services/persistenceService';
import { migrateGuestToCloud } from '../services/syncService';
import { AppLoadingOverlay } from '../components/common/AppLoadingOverlay';

import { Link, useNavigate, useLocation } from 'react-router-dom';

const ROOM_NAVIGATION_STATE = { skipRoomLoadingDelay: true };

const getPostSignupDestination = (
    state: unknown,
): { to: string; navigationState?: Record<string, unknown> } => {
    if (
        state &&
        typeof state === 'object' &&
        'postSignupRedirectTo' in state &&
        typeof (state as { postSignupRedirectTo?: unknown }).postSignupRedirectTo === 'string'
    ) {
        return {
            to: (state as { postSignupRedirectTo: string }).postSignupRedirectTo,
        };
    }

    return {
        to: '/room',
        navigationState: ROOM_NAVIGATION_STATE,
    };
};

export const SignupPage: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { t } = useTranslation();
    const { loading } = useAuth(); // Destructure loading from context
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        confirmPassword: '',
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isRedirecting, setIsRedirecting] = useState(false);
    const [showLoginHint, setShowLoginHint] = useState(false);
    const rootRef = React.useRef<HTMLDivElement | null>(null);
    const [errors, setErrors] = useState<{
        email?: string;
        password?: string;
        confirmPassword?: string;
        general?: string;
    }>({});
    const postSignupDestination = React.useMemo(
        () => getPostSignupDestination(location.state),
        [location.state],
    );

    useMobileInteractionGuard({ rootRef, blockSelection: false });

    React.useEffect(() => {
        const checkRedirect = async () => {
            try {
                const result = await getRedirectResult(auth);
                if (result) {
                    playButtonSound();
                    navigate(postSignupDestination.to, {
                        replace: true,
                        state: postSignupDestination.navigationState,
                    });
                }
            } catch (error: any) {
                console.error('Google Signup (Redirect) failed:', error);
                setErrors({ general: t('auth.errors.googleFailed') });
            }
        };
        checkRedirect();
    }, [navigate, postSignupDestination, t]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        if (errors[name as keyof typeof errors] || errors.general) {
            setErrors(prev => ({ ...prev, [name]: undefined, general: undefined }));
        }
        if (name === 'email' && showLoginHint) {
            setShowLoginHint(false);
        }
    };

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        playButtonSound();

        if (isSubmitting || loading) return;
        setIsSubmitting(true);
        setErrors({});
        setShowLoginHint(false);

        // Validation: Check mismatch
        if (formData.password !== formData.confirmPassword) {
            setErrors({ confirmPassword: t('auth.signup.passwordMismatch') });
            setIsSubmitting(false); // Fix: Reset state so user can try again
            return;
        }

        // Use setTimeout to ensure the "Loading" overlay renders/paints 
        // BEFORE the heavy Firebase/Network operation starts.
        setTimeout(async () => {
            try {
                const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
                const user = userCredential.user;

                // [MIGRATION] Transfer Guest Data to New User
                const guestId = localStorage.getItem('puzzleletic_guest_id');
                if (guestId) {
                    try {
                        const guestData = loadNurturingState(guestId);
                        // Only migrate if there is actual data (character exists)
                        if (guestData && guestData.hasCharacter) {


                            // 1. Save to User's Local Storage (Instant Access for UI)
                            saveNurturingState(guestData, user.uid);

                            // 2. Upload to Cloud (Persistence & Backup)
                            // This ensures the data is safely stored in D1
                            await migrateGuestToCloud(user, guestData);

                            // 3. Cleanup Guest Data (Method 1: Force clear so "Continue" doesn't show on logout)
                            const guestStorageKey = getStorageKey(guestId);
                            localStorage.removeItem('puzzleletic_guest_id'); // Clear Guest ID
                            localStorage.removeItem(guestStorageKey);        // Clear Guest Data
                            // console.log('🧹 [Signup] Guest data cleared from local (Method 1 applied).');


                        }
                    } catch (e) {
                        console.error('⚠️ [Signup] Data Migration Failed:', e);
                        // Continue anyway, don't block signup flow
                    }
                }

                // alert(t('auth.signup.success')); // REMOVED: Smoother flow without popup
                navigate(postSignupDestination.to, {
                    replace: true,
                    state: postSignupDestination.navigationState,
                });
            } catch (error: any) {
                console.error('Signup failed:', error);
                setIsSubmitting(false); // Enable retry
                if (error.code === 'auth/email-already-in-use') {
                    setErrors({ email: t('auth.errors.emailInUse') });
                    setShowLoginHint(true);
                    return;
                }

                if (error.code === 'auth/weak-password') {
                    setErrors({ password: t('auth.errors.weakPassword') });
                    return;
                }

                if (error.code === 'auth/invalid-email') {
                    setErrors({ email: t('auth.errors.invalidEmail') });
                    return;
                }

                setErrors({ general: t('auth.errors.registrationFailed') });
            }
        }, 50); // Small delay to allow React render cycle to complete
    };

    const handleGoogleSignup = async () => {
        playButtonSound();
        setErrors({});

        try {
            await signInWithPopup(auth, googleProvider);
            navigate(postSignupDestination.to, {
                replace: true,
                state: postSignupDestination.navigationState,
            });
        } catch (error: any) {
            const shouldFallbackToRedirect =
                error?.code === 'auth/popup-blocked' ||
                error?.code === 'auth/cancelled-popup-request' ||
                error?.code === 'auth/operation-not-supported-in-this-environment';

            if (shouldFallbackToRedirect) {
                try {
                    setIsRedirecting(true);
                    await signInWithRedirect(auth, googleProvider);
                    return;
                } catch (redirectError: any) {
                    console.error('Google Signup (Redirect fallback) failed:', redirectError);
                    setIsRedirecting(false);
                    setErrors({ general: t('auth.errors.googleFailed') });
                    return;
                }
            }

            console.error('Google Signup failed:', error);
            setIsRedirecting(false);
            if (error.code !== 'auth/popup-closed-by-user') {
                setErrors({ general: t('auth.errors.googleFailed') });
            }
        }
    };

    const handleBackToLogin = () => {
        playButtonSound();
        navigate('/login');
    };

    return (
        <div ref={rootRef} className="auth-page auth-page--signup mobile-ui-guard">
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

            {isSubmitting && <AppLoadingOverlay />}

            <div className="auth-container auth-container--signup">
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

                <header className="auth-header auth-header--signup">
                    <h1>{t('auth.signup.title')}</h1>
                    <p>{t('auth.signup.subtitle')}</p>
                </header>

                <div className="auth-login__actions">
                    <button
                        type="button"
                        className="auth-btn auth-btn--google"
                        onClick={handleGoogleSignup}
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

                <div className="auth-divider auth-divider--signup">{t('auth.login.or')}</div>

                <form className="auth-form auth-form--signup" onSubmit={handleSignup}>
                    <div className="form-group">
                        <label className="form-label">{t('auth.signup.emailLabel')}</label>
                        <input
                            type="email"
                            name="email"
                            className={`form-input ${errors.email ? 'form-input--error' : ''}`}
                            placeholder={t('auth.signup.emailPlaceholder')}
                            value={formData.email}
                            onChange={handleChange}
                            aria-invalid={Boolean(errors.email)}
                            required
                        />
                        {errors.email && <p className="form-error">{errors.email}</p>}
                        {showLoginHint && (
                            <button
                                type="button"
                                className="form-inline-link"
                                onClick={handleBackToLogin}
                            >
                                {t('auth.signup.loginLink')}
                            </button>
                        )}
                    </div>

                    <div className="form-group">
                        <label className="form-label">{t('auth.signup.passwordLabel')}</label>
                        <input
                            type="password"
                            name="password"
                            className={`form-input ${errors.password ? 'form-input--error' : ''}`}
                            placeholder={t('auth.signup.passwordPlaceholder')}
                            value={formData.password}
                            onChange={handleChange}
                            aria-invalid={Boolean(errors.password)}
                            required
                        />
                        {errors.password && <p className="form-error">{errors.password}</p>}
                    </div>

                    <div className="form-group">
                        <label className="form-label">{t('auth.signup.confirmPasswordLabel')}</label>
                        <input
                            type="password"
                            name="confirmPassword"
                            className={`form-input ${errors.confirmPassword ? 'form-input--error' : ''}`}
                            placeholder={t('auth.signup.confirmPasswordPlaceholder')}
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            aria-invalid={Boolean(errors.confirmPassword)}
                            required
                        />
                        {errors.confirmPassword && <p className="form-error">{errors.confirmPassword}</p>}
                    </div>

                    <button type="submit" className="auth-btn auth-btn--primary" disabled={loading || isSubmitting} style={{ width: '100%' }}>
                        {isSubmitting ? t('auth.signing_up') : t('auth.signup.action')}
                    </button>
                    <p className="auth-consent-text auth-consent-text--signup">
                        {t('auth.signup.consentPrefix')}
                        <Link to="/terms" className="auth-consent-link">{t('auth.signup.termsLink')}</Link>
                        {t('auth.signup.consentConnector')}
                        <Link to="/privacy" className="auth-consent-link">{t('auth.signup.privacyLink')}</Link>
                        {t('auth.signup.consentSuffix')}
                    </p>
                    {errors.general && <p className="form-error form-error--general">{errors.general}</p>}
                </form>

                <div className="auth-login__footer-link auth-login__footer-link--signup">
                    <span>{t('auth.signup.haveAccount')}</span>
                    <button
                        type="button"
                        className="auth-link-btn auth-link-btn--inline"
                        onClick={handleBackToLogin}
                    >
                        {t('auth.signup.loginLink')}
                    </button>
                </div>
            </div>
        </div>
    );
};
