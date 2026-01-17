import React, { useState } from 'react';
import './Auth.css';
import { playButtonSound } from '../utils/sound';
import { useTranslation } from 'react-i18next';
import { auth, googleProvider } from '../firebase';
import { signInWithEmailAndPassword, signInWithPopup, signInWithRedirect, getRedirectResult } from 'firebase/auth';

import { useNavigate } from 'react-router-dom';

// interface LoginPageProps removed as it's no longer needed (or empty)
export const LoginPage: React.FC = () => {
    const navigate = useNavigate();
    const { t } = useTranslation();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isRedirecting, setIsRedirecting] = useState(false);

    // Handle Redirect Result (for Mobile/Tablet flow)
    React.useEffect(() => {
        const checkRedirect = async () => {
            try {
                const result = await getRedirectResult(auth);
                if (result) {
                    console.log('Google Login (Redirect) successful', result);
                    playButtonSound();
                    navigate('/home');
                }
            } catch (error: any) {
                console.error('Google Login (Redirect) failed:', error);
                alert(t('auth.errors.googleFailed'));
            }
        };
        checkRedirect();
    }, [navigate, t]);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        playButtonSound();

        try {
            await signInWithEmailAndPassword(auth, email, password);
            console.log('Login successful');
            navigate('/home');
        } catch (error: any) {
            console.error('Login failed:', error);
            let errorMessage = t('auth.errors.default');

            if (error.code === 'auth/invalid-credential' || error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
                errorMessage = t('auth.errors.invalidCredential');
            } else if (error.code === 'auth/too-many-requests') {
                errorMessage = t('auth.errors.tooManyRequests');
            }

            alert(errorMessage);
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
                console.log('Google Login (Popup) successful');
                navigate('/home');
            }
        } catch (error: any) {
            console.error('Google Login failed:', error);
            setIsRedirecting(false);
            if (error.code !== 'auth/popup-closed-by-user') {
                alert(t('auth.errors.googleFailed'));
            }
        }
    };

    /*
        const handleAppleLogin = async () => {
            playButtonSound();
            try {
                await signInWithPopup(auth, appleProvider);
                console.log('Apple Login successful');
                navigate('/home');
            } catch (error: any) {
                 console.error('Apple Login failed:', error);
                 alert("Apple Sign-In failed ❌. Please check your configuration.");
            }
        };
    */

    const handleGoToSignup = () => {
        playButtonSound();
        navigate('/signup');
    };

    /*
    const handleBackToHome = () => {
        playButtonSound();
        // For now, back to home logic or main landing. 
        // If unauthenticated, maybe stay here? But let's assume home is protected.
        navigate('/');
    };
    */

    return (
        <div className="auth-page">
            {/* Back to Home Button */}
            {/* Back to Home Button Removed per user request */}

            <div className="auth-container">
                <header className="auth-header">
                    <h1>{t('auth.login.title')}</h1>
                    <p>{t('auth.login.subtitle')}</p>
                </header>

                <form className="auth-form" onSubmit={handleLogin}>
                    <div className="form-group">
                        <label className="form-label">{t('auth.login.email')}</label>
                        <input
                            type="email"
                            className="form-input"
                            placeholder={t('auth.login.emailPlaceholder')}
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">{t('auth.login.password')}</label>
                        <input
                            type="password"
                            className="form-input"
                            placeholder={t('auth.login.passwordPlaceholder')}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>

                    <button type="submit" className="auth-btn auth-btn--primary">
                        {t('auth.login.action')}
                    </button>
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
