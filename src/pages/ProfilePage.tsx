import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import { useNurturing } from '../contexts/NurturingContext';
import './ProfilePage.css';

export const ProfilePage: React.FC = () => {
    const navigate = useNavigate();
    const { t } = useTranslation();
    const { user } = useAuth();
    const { pauseTick, resumeTick } = useNurturing();
    // Simulate Premium Status for UI Demo
    const [isPremium, setIsPremium] = React.useState(false);

    // Pause ticks when entering Profile page, resume when leaving
    useEffect(() => {
        pauseTick();
        return () => {
            resumeTick();
        };
    }, [pauseTick, resumeTick]);

    const handlePurchase = () => {
        if (window.confirm("Simulate Premium Purchase?")) {
            setIsPremium(true);
        }
    };

    return (
        <div className="profile-page">
            <header className="profile-header">
                <h1>👤 {t('profile.title')}</h1>
                <button className="close-button" onClick={() => navigate('/home')} aria-label="Close">
                    ✕
                </button>
            </header>

            <div className="profile-content">
                {/* Unified Account & Membership Section */}
                <section className="profile-section">

                    {/* Account Status Card (Designed like Subscription Buttons) */}
                    <div className={`account-status-card ${isPremium ? 'premium-active' : ''}`}>
                        <div className="sub-info-left">
                            <span className="sub-title">{t('profile.signedInAs')}</span>
                            <span className="sub-desc">{user?.email || t('profile.guestUser')}</span>
                        </div>
                        <div className="sub-price-right">
                            <div className={`status-badge-pill ${isPremium ? 'premium' : 'free'}`}>
                                {isPremium ? t('profile.status.premium') : t('profile.status.free')}
                            </div>
                        </div>
                    </div>

                    {!isPremium && (
                        <div className="premium-upgrade-area">
                            <p className="upgrade-prompt">{t('profile.upgradePrompt')}</p>
                            <div className="subscription-options">
                                {/* Quarterly Card */}
                                <button className="sub-btn quarterly" onClick={handlePurchase}>
                                    <div className="sub-info-left">
                                        <span className="sub-title">{t('profile.subscription.quarterly.title')}</span>
                                        <span className="sub-desc">{t('profile.subscription.quarterly.desc')}</span>
                                    </div>
                                    <div className="sub-price-right">
                                        <span className="sub-monthly-price">$1.15 <span className="sub-currency">{t('profile.subscription.currency')}</span></span>
                                        <span className="sub-unit">{t('profile.subscription.unit')}</span>
                                    </div>
                                </button>

                                {/* Yearly Card */}
                                <button className="sub-btn yearly" onClick={handlePurchase}>
                                    <span className="sub-badge">{t('profile.subscription.yearly.badge')}</span>
                                    <div className="sub-info-left">
                                        <span className="sub-title">{t('profile.subscription.yearly.title')}</span>
                                        <span className="sub-desc">{t('profile.subscription.yearly.desc')}</span>
                                    </div>
                                    <div className="sub-price-right">
                                        <span className="sub-monthly-price">$1.00 <span className="sub-currency">{t('profile.subscription.currency')}</span></span>
                                        <span className="sub-unit">{t('profile.subscription.unit')}</span>
                                    </div>
                                </button>
                            </div>
                            <p className="cancel-text">{t('profile.cancelPolicy')}</p>
                        </div>
                    )}
                </section>

                {/* Section 3: My Jello Box Link */}
                <section className="profile-section">
                    <button className="jello-box-link" onClick={() => navigate('/jellobox')}>
                        📚 {t('profile.myJelloBox')}
                    </button>
                </section>
            </div>
        </div>
    );
};
