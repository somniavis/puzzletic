import React, { useState } from 'react';
import './Auth.css';
import { playButtonSound } from '../utils/sound';
import { useTranslation } from 'react-i18next';

interface LoginPageProps {
    onNavigate: (page: string) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onNavigate }) => {
    const { t } = useTranslation();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        playButtonSound();
        // Simulate login success for UI demo
        console.log('Logging in with:', email, password);
        onNavigate('home');
    };

    const handleGoToSignup = () => {
        playButtonSound();
        onNavigate('signup');
    };

    const handleHomeClick = () => {
        playButtonSound();
        onNavigate('home');
    };

    return (
        <div className="auth-page">
            {/* Back to Home Button */}
            <div className="back-btn-container">
                <button className="back-btn" onClick={handleHomeClick} title={t('auth.login.backToHome')}>
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
                        className="auth-btn auth-btn--secondary"
                        onClick={handleGoToSignup}
                    >
                        {t('auth.login.signup')}
                    </button>
                </div>
            </div>
        </div>
    );
};
