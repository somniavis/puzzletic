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
    const { pauseTick, resumeTick, gro, xp, addRewards, maxStats, subscription, purchasePlan, debugUnlockAllGames } = useNurturing();
    const isPremium = subscription.isPremium;

    // Pause ticks when entering Profile page, resume when leaving
    useEffect(() => {
        pauseTick();
        return () => {
            resumeTick();
        };
    }, [pauseTick, resumeTick]);

    const handlePurchase = async (plan: '3_months' | '12_months') => {
        if (window.confirm(`Confirm purchase for ${plan === '3_months' ? '3 Months' : '1 Year'}?`)) {
            const success = await purchasePlan(plan);
            if (success) {
                alert("Purchase Successful! (Mock)");
            } else {
                alert("Purchase Failed. See console.");
            }
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
                        <span className={`status-badge ${isPremium ? 'premium' : 'free'}`}>
                            {isPremium ? t('profile.status.premium') : t('profile.status.free')}
                        </span>
                        <div className="sub-info-left">
                            <span className="sub-title">{t('profile.signedInAs')}</span>
                            <span className="sub-desc">{user?.email || t('profile.guestUser')}</span>
                            {isPremium && subscription.expiryDate && (
                                <span className="sub-desc" style={{ fontSize: '0.8rem', opacity: 0.8 }}>
                                    Expires: {new Date(subscription.expiryDate).toLocaleDateString()}
                                </span>
                            )}
                        </div>
                    </div>

                    {!isPremium && (
                        <div className="premium-upgrade-area">
                            <p className="upgrade-prompt">{t('profile.upgradePrompt')}</p>
                            <div className="subscription-options">
                                {/* Quarterly Card */}
                                <button className="sub-btn quarterly" onClick={() => handlePurchase('3_months')}>
                                    <div className="sub-info-left">
                                        <span className="sub-title">{t('profile.subscription.quarterly.title')}</span>
                                        <span className="sub-desc">{t('profile.subscription.quarterly.desc')}</span>
                                    </div>
                                    <div className="sub-price-right">
                                        <span className="sub-monthly-price">$1.33 <span className="sub-currency">{t('profile.subscription.currency')}</span></span>
                                        <span className="sub-unit">{t('profile.subscription.unit')}</span>
                                    </div>
                                </button>

                                {/* Yearly Card */}
                                <button className="sub-btn yearly" onClick={() => handlePurchase('12_months')}>
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

                {/* DEBUG Section - Remove before production */}
                <section className="profile-section" style={{ background: '#ffebee', border: '2px dashed #f44336' }}>
                    <p style={{ color: '#c62828', fontWeight: 'bold', marginBottom: '0.5rem' }}>🔧 DEBUG MODE (GRO: {gro} | XP: {xp})</p>
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                        <button
                            style={{
                                background: '#4CAF50',
                                color: 'white',
                                padding: '12px 24px',
                                borderRadius: '12px',
                                border: 'none',
                                fontWeight: 'bold',
                                cursor: 'pointer',
                                flex: 1
                            }}
                            onClick={() => {
                                addRewards(0, 50); // Add 0 XP, 50 GRO
                                alert(`✅ Added 50 GRO!\nNew total: ${gro + 50}`);
                            }}
                        >
                            💰 +50 GRO
                        </button>
                        <button
                            style={{
                                background: '#2196F3',
                                color: 'white',
                                padding: '12px 24px',
                                borderRadius: '12px',
                                border: 'none',
                                fontWeight: 'bold',
                                cursor: 'pointer',
                                flex: 1
                            }}
                            onClick={() => {
                                addRewards(500, 0); // Add 500 XP, 0 GRO
                                alert(`✅ Added 500 XP!\nNew total: ${xp + 500}`);
                            }}
                        >
                            ⭐ +500 XP
                        </button>
                        <button
                            style={{
                                background: '#9C27B0',
                                color: 'white',
                                padding: '12px 24px',
                                borderRadius: '12px',
                                border: 'none',
                                fontWeight: 'bold',
                                cursor: 'pointer',
                                flex: 1
                            }}
                            onClick={() => {
                                const result = maxStats();
                                alert(result.message);
                            }}
                        >
                            🌟 Max Stats
                        </button>
                        <button
                            style={{
                                background: '#607D8B',
                                color: 'white',
                                padding: '12px 24px',
                                borderRadius: '12px',
                                border: 'none',
                                fontWeight: 'bold',
                                cursor: 'pointer',
                                flex: 1
                            }}
                            onClick={() => navigate('/debug/layouts')}
                        >
                            🎨 Layout Preview
                        </button>
                        <button
                            style={{
                                background: '#FF9800',
                                color: 'white',
                                padding: '12px 24px',
                                borderRadius: '12px',
                                border: 'none',
                                fontWeight: 'bold',
                                cursor: 'pointer',
                                flex: 1
                            }}
                            onClick={() => {
                                localStorage.setItem('FORCE_TRAIN', 'true');
                                alert("🚂 Train Queued! Go back to Pet Room.");
                            }}
                        >
                            🚂 Call Train
                        </button>
                        <button
                            style={{
                                background: '#FF5722',
                                color: 'white',
                                padding: '12px 24px',
                                borderRadius: '12px',
                                border: 'none',
                                fontWeight: 'bold',
                                cursor: 'pointer',
                                flex: 1
                            }}
                            onClick={() => {
                                if (confirm("Unlock ALL games for testing?")) {
                                    debugUnlockAllGames();
                                }
                            }}
                        >
                            🔓 Unlock All
                        </button>
                    </div>
                </section>
            </div>
        </div>
    );
};
