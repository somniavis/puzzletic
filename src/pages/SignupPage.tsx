import React, { useState } from 'react';
import './Auth.css';
import { playButtonSound } from '../utils/sound';
import { useTranslation } from 'react-i18next';

interface SignupPageProps {
    onNavigate: (page: string) => void;
}

export const SignupPage: React.FC<SignupPageProps> = ({ onNavigate }) => {
    const { t } = useTranslation();
    const [formData, setFormData] = useState({
        email: '',
        nickname: '',
        password: '',
        confirmPassword: ''
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSignup = (e: React.FormEvent) => {
        e.preventDefault();
        playButtonSound();

        if (formData.password !== formData.confirmPassword) {
            alert(t('auth.signup.passwordMismatch'));
            return;
        }

        // Simulate signup success
        console.log('Signing up with:', formData);
        alert(t('auth.signup.success'));
        onNavigate('login');
    };

    const handleBackToLogin = () => {
        playButtonSound();
        onNavigate('login');
    };

    return (
        <div className="auth-page">
            <div className="back-btn-container">
                <button className="back-btn" onClick={handleBackToLogin} title={t('auth.signup.backToLogin')}>
                    ⬅️
                </button>
            </div>

            <div className="auth-container">
                <header className="auth-header">
                    <h1>{t('auth.signup.title')}</h1>
                    <p>{t('auth.signup.subtitle')}</p>
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
                        <label className="form-label">{t('auth.signup.nicknameLabel')}</label>
                        <input
                            type="text"
                            name="nickname"
                            className="form-input"
                            placeholder={t('auth.signup.nicknamePlaceholder')}
                            value={formData.nickname}
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

                    <button type="submit" className="auth-btn auth-btn--primary">
                        {t('auth.signup.action')}
                    </button>
                </form>

                <div className="auth-divider">
                    {t('auth.signup.haveAccount')}
                </div>

                <button
                    className="auth-link-btn"
                    onClick={handleBackToLogin}
                >
                    {t('auth.signup.loginLink')}
                </button>
            </div>
        </div>
    );
};
