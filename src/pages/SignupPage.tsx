import React, { useState } from 'react';
import './Auth.css';
import { playButtonSound } from '../utils/sound';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext'; // Import useAuth
import { auth } from '../firebase';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { loadNurturingState, saveNurturingState, getStorageKey } from '../services/persistenceService';
import { migrateGuestToCloud } from '../services/syncService';

import { useNavigate, useLocation } from 'react-router-dom';

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
    const [errors, setErrors] = useState<{
        email?: string;
        password?: string;
        confirmPassword?: string;
        general?: string;
    }>({});

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        if (errors[name as keyof typeof errors] || errors.general) {
            setErrors(prev => ({ ...prev, [name]: undefined, general: undefined }));
        }
    };

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        playButtonSound();

        if (isSubmitting || loading) return;
        setIsSubmitting(true);
        setErrors({});

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
                navigate('/home');
            } catch (error: any) {
                console.error('Signup failed:', error);
                setIsSubmitting(false); // Enable retry
                if (error.code === 'auth/email-already-in-use') {
                    setErrors({ email: t('auth.errors.emailInUse') });
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

    const handleBackToLogin = () => {
        playButtonSound();
        navigate('/login');
    };

    return (
        <div className="auth-page">
            {isSubmitting && (
                <div style={{
                    position: 'fixed',
                    inset: 0,
                    zIndex: 200,
                    background: 'linear-gradient(135deg, #FFF9E6 0%, #FFE4B5 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexDirection: 'column'
                }}>
                    <div className="loading-spinner-container">
                        <div className="loading-spinner">🐾</div>
                        <div className="loading-text" style={{
                            fontSize: '1.2rem',
                            fontWeight: 800,
                            color: '#8B4513',
                            textTransform: 'uppercase',
                            letterSpacing: '2px',
                            marginTop: '1rem',
                            animation: 'pulse-text 1.5s infinite ease-in-out'
                        }}>
                            {t('common.loading')}...
                        </div>
                    </div>
                </div>
            )}

            <div className="auth-container">
                <header className="auth-header" style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '16px',
                    textAlign: 'left'
                }}>
                    <div>
                        <h1 style={{ margin: 0, fontSize: '1.8rem', lineHeight: '1.2' }}>{t('auth.signup.title')}</h1>
                        <p style={{ margin: '4px 0 0 0', fontSize: '0.9rem', opacity: 0.9 }}>{t('auth.signup.subtitle')}</p>
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
                        aria-label="Back"
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

                <form className="auth-form" onSubmit={handleSignup}>
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
                    {errors.general && <p className="form-error form-error--general">{errors.general}</p>}
                </form>

                <div className="auth-divider">
                    {t('auth.signup.haveAccount')}
                </div>

                <button
                    className="auth-btn"
                    onClick={handleBackToLogin}
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
                    <span style={{ fontSize: '18px' }}>🔑</span>
                    {t('auth.signup.loginLink')}
                </button>
            </div>
        </div>
    );
};
