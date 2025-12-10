import React, { useState } from 'react';
import './Auth.css';
import { playButtonSound } from '../utils/sound';
import { useTranslation } from 'react-i18next';
import { auth, googleProvider, appleProvider } from '../firebase';
import { signInWithEmailAndPassword, signInWithPopup } from 'firebase/auth';

import { useNavigate } from 'react-router-dom';

// interface LoginPageProps removed as it's no longer needed (or empty)
export const LoginPage: React.FC = () => {
    const navigate = useNavigate();
    const { t } = useTranslation();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        playButtonSound();

        try {
            await signInWithEmailAndPassword(auth, email, password);
            console.log('Login successful');
            navigate('/home');
        } catch (error: any) {
            console.error('Login failed:', error);
            let errorMessage = "Login failed! ❌";

            if (error.code === 'auth/invalid-credential' || error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
                errorMessage = "Invalid email or password. Please check again.";
            } else if (error.code === 'auth/too-many-requests') {
                errorMessage = "Too many failed attempts. Please try again later.";
            }

            alert(errorMessage);
        }
    };

    const handleGoogleLogin = async () => {
        playButtonSound();
        try {
            await signInWithPopup(auth, googleProvider);
            console.log('Google Login successful');
            navigate('/home');
        } catch (error: any) {
            console.error('Google Login failed:', error);
            alert("Google Sign-In failed ❌. Please try again.");
        }
    };

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

    const handleGoToSignup = () => {
        playButtonSound();
        navigate('/signup');
    };

    const handleBackToHome = () => {
        playButtonSound();
        // For now, back to home logic or main landing. 
        // If unauthenticated, maybe stay here? But let's assume home is protected.
        navigate('/');
    };

    return (
        <div className="auth-page">
            {/* Back to Home Button */}
            <div className="back-btn-container">
                <button className="back-btn" onClick={handleBackToHome} title={t('auth.login.backToHome')}>
                    🏠
                </button>
            </div>

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
                        className="auth-btn auth-btn--google"
                        onClick={handleGoogleLogin}
                        style={{
                            backgroundColor: '#ffffff',
                            color: '#757575',
                            border: '1px solid #ddd',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px',
                            fontSize: '15px'
                        }}
                    >
                        <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" style={{ width: '18px', height: '18px' }} />
                        Sign in with Google
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
                            fontSize: '15px'
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
