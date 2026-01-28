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

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        playButtonSound();

        if (isSubmitting || loading) return;
        setIsSubmitting(true);

        if (formData.password !== formData.confirmPassword) {
            alert(t('auth.signup.passwordMismatch'));
            return;
        }

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

            alert(t('auth.signup.success'));
            navigate('/home');
        } catch (error: any) {
            console.error('Signup failed:', error);
            setIsSubmitting(false); // Enable retry
            let errorMessage = t('auth.errors.registrationFailed');


            if (error.code === 'auth/email-already-in-use') {
                errorMessage = t('auth.errors.emailInUse');
            } else if (error.code === 'auth/weak-password') {
                errorMessage = t('auth.errors.weakPassword');
            } else if (error.code === 'auth/invalid-email') {
                errorMessage = t('auth.errors.invalidEmail');
            }

            alert(errorMessage);
        }
    };

    const handleBackToLogin = () => {
        playButtonSound();
        navigate('/login');
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
                            className="form-input"
                            placeholder={t('auth.signup.emailPlaceholder')}
                            value={formData.email}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">{t('auth.signup.passwordLabel')}</label>
                        <input
                            type="password"
                            name="password"
                            className="form-input"
                            placeholder={t('auth.signup.passwordPlaceholder')}
                            value={formData.password}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">{t('auth.signup.confirmPasswordLabel')}</label>
                        <input
                            type="password"
                            name="confirmPassword"
                            className="form-input"
                            placeholder={t('auth.signup.confirmPasswordPlaceholder')}
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <button type="submit" className="auth-btn auth-btn--primary" disabled={loading || isSubmitting} style={{ width: '100%' }}>
                        {isSubmitting ? t('auth.signing_up') : t('auth.signup.action')}
                    </button>
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
