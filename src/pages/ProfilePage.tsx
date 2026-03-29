import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTranslation, Trans } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import { useNurturing } from '../contexts/NurturingContext';
import './ProfilePage.css';

type ProfileTab = 'my_jello' | 'pass';

const createParentGateCode = () =>
    Array.from({ length: 3 }, () => Math.floor(Math.random() * 9) + 1);

export const ProfilePage: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { t } = useTranslation();
    const [showCancelModal, setShowCancelModal] = React.useState(false);
    const [activeTab, setActiveTab] = React.useState<ProfileTab>('my_jello');
    const [isPassUnlocked, setIsPassUnlocked] = React.useState(false);
    const [parentGateCode, setParentGateCode] = React.useState<number[]>(() => createParentGateCode());
    const [parentGateInput, setParentGateInput] = React.useState('');
    const [parentGateError, setParentGateError] = React.useState('');
    const { user } = useAuth();
    const { gro, xp, addRewards, maxStats, subscription, purchasePlan, cancelSubscription, debugUnlockAllGames, debugAddStars } = useNurturing();
    const isPremium = subscription.isPremium;
    const isGuest = !user;
    const parentGateWordSequence = parentGateCode
        .map((digit) => t(`profile.parentGate.numberWords.${digit}`))
        .join(',  ');

    React.useEffect(() => {
        const requestedTab = new URLSearchParams(location.search).get('tab');

        if (requestedTab === 'pass') {
            setActiveTab('pass');
            if (!isPassUnlocked) {
                setParentGateCode(createParentGateCode());
                setParentGateInput('');
                setParentGateError('');
            }
            return;
        }

        if (requestedTab === 'my_jello') {
            setActiveTab('my_jello');
        }
    }, [location.search, isPassUnlocked]);

    const handleCancelSubscription = async () => {
        const success = await cancelSubscription();
        if (success) {
            alert(t('profile.cancelSuccess'));
            setShowCancelModal(false);
        }
    };

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

    const handlePassTabOpen = () => {
        setActiveTab('pass');
        if (!isPassUnlocked) {
            setParentGateCode(createParentGateCode());
            setParentGateInput('');
            setParentGateError('');
        }
    };

    const handleParentGateDigit = (digit: number) => {
        if (isPassUnlocked || parentGateInput.length >= 3) {
            return;
        }

        const nextInput = `${parentGateInput}${digit}`;
        setParentGateInput(nextInput);
        setParentGateError('');

        if (nextInput.length === 3) {
            const targetCode = parentGateCode.join('');

            if (nextInput === targetCode) {
                setIsPassUnlocked(true);
                return;
            }

            setParentGateError(t('profile.parentGate.error'));
            setParentGateInput('');
            setParentGateCode(createParentGateCode());
        }
    };

    const handleParentGateClear = () => {
        setParentGateInput('');
        setParentGateError('');
    };

    const handleParentGateReset = () => {
        setParentGateCode(createParentGateCode());
        setParentGateInput('');
        setParentGateError('');
    };

    return (
        <div className="profile-page">
            <header className="profile-header">
                <div className="profile-tabs" role="tablist" aria-label={t('profile.title')}>
                    <button
                        type="button"
                        role="tab"
                        className={`profile-tab ${activeTab === 'my_jello' ? 'active' : ''}`}
                        aria-selected={activeTab === 'my_jello'}
                        onClick={() => setActiveTab('my_jello')}
                    >
                        {t('profile.tabs.myJello')}
                    </button>
                    <button
                        type="button"
                        role="tab"
                        className={`profile-tab ${activeTab === 'pass' ? 'active' : ''}`}
                        aria-selected={activeTab === 'pass'}
                        onClick={handlePassTabOpen}
                    >
                        {t('profile.tabs.pass')}
                    </button>
                </div>
                <button className="close-button" onClick={() => navigate('/home')} aria-label={t('common.close')}>
                    ✕
                </button>
            </header>

            <div className="profile-content">
                {activeTab === 'my_jello' && (
                    <>
                        <section className="profile-section">
                            <div className="profile-panel-heading">
                                <h2>{t('profile.profileInfo')}</h2>
                            </div>
                            <div
                                className={`account-status-card ${isPremium ? 'premium-active' : ''}`}
                                onClick={() => {
                                    if (isGuest) {
                                        navigate('/signup', { state: { from: '/profile' } });
                                    }
                                }}
                                style={{ cursor: isGuest ? 'pointer' : 'default' }}
                            >
                                <span className={`status-badge ${isPremium ? 'premium' : 'free'}`}>
                                    {isPremium ? t('profile.status.premium') : t('profile.status.free')}
                                </span>
                                <div className="sub-info-left">
                                    <span className="sub-title">{t('profile.signedInAs')}</span>
                                    <span className="sub-desc">{user?.email || t('profile.guestUser')}</span>
                                </div>
                            </div>
                        </section>

                        <section className="profile-section">
                            <button className="jello-box-link" onClick={() => navigate('/jellobox')}>
                                📚 {t('profile.myJelloBox')}
                            </button>
                        </section>

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
                                        addRewards(0, 150);
                                        alert(`✅ Added 150 GRO!\nNew total: ${gro + 150}`);
                                    }}
                                >
                                    💰 +150 GRO
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
                                        addRewards(500, 0);
                                        alert(`✅ Added 500 XP!\nNew total: ${xp + 500}`);
                                    }}
                                >
                                    ⭐ +500 XP
                                </button>
                                <button
                                    style={{
                                        background: '#FFC107',
                                        color: 'black',
                                        padding: '12px 24px',
                                        borderRadius: '12px',
                                        border: 'none',
                                        fontWeight: 'bold',
                                        cursor: 'pointer',
                                        flex: 1
                                    }}
                                    onClick={() => {
                                        if (typeof debugAddStars === 'function') {
                                            debugAddStars(1001);
                                        } else {
                                            alert("Debug function not ready yet");
                                        }
                                    }}
                                >
                                    🌟 +1001 Stars
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
                    </>
                )}

                {activeTab === 'pass' && (
                    <>
                        {!isPassUnlocked && (
                            <section className="profile-section parent-gate-section">
                                <div className="profile-panel-heading">
                                    <h2 className="parent-gate-title-sign">{t('profile.parentGate.title')}</h2>
                                </div>
                                <p className="parent-gate-instruction">
                                    {t('profile.parentGate.instruction')}
                                </p>
                                <p className="parent-gate-code-words">{parentGateWordSequence}</p>
                                <div className="parent-gate-display" aria-label={t('profile.parentGate.displayLabel')}>
                                    {Array.from({ length: 3 }, (_, index) => (
                                        <span key={`parent-gate-slot-${index}`} className="parent-gate-slot">
                                            {parentGateInput[index] || '•'}
                                        </span>
                                    ))}
                                </div>
                                {parentGateError && <p className="parent-gate-error">{parentGateError}</p>}
                                <div className="parent-gate-keypad">
                                    {Array.from({ length: 9 }, (_, index) => {
                                        const digit = index + 1;
                                        return (
                                            <button
                                                key={`parent-gate-digit-${digit}`}
                                                type="button"
                                                className="parent-gate-key"
                                                onClick={() => handleParentGateDigit(digit)}
                                            >
                                                {digit}
                                            </button>
                                        );
                                    })}
                                </div>
                                <div className="parent-gate-actions">
                                    <button type="button" className="parent-gate-action secondary" onClick={handleParentGateClear}>
                                        {t('profile.parentGate.clear')}
                                    </button>
                                    <button type="button" className="parent-gate-action" onClick={handleParentGateReset}>
                                        {t('profile.parentGate.reset')}
                                    </button>
                                </div>
                            </section>
                        )}

                        {isPassUnlocked && (
                            <section className="profile-section">
                                <div className="profile-panel-heading">
                                    <span className="profile-panel-kicker">{t('profile.tabs.pass')}</span>
                                    <h2>{t('profile.paymentInfo')}</h2>
                                </div>

                                <div
                                    className={`account-status-card ${isPremium ? 'premium-active' : ''}`}
                                    onClick={() => {
                                        if (isGuest) {
                                            navigate('/signup', { state: { from: '/profile' } });
                                        }
                                    }}
                                    style={{ cursor: isGuest ? 'pointer' : 'default' }}
                                >
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
                                        {isPremium && (
                                            <button
                                                className="text-btn"
                                                onClick={() => setShowCancelModal(true)}
                                                style={{
                                                    fontSize: '0.8rem',
                                                    color: '#999',
                                                    textDecoration: 'underline',
                                                    background: 'none',
                                                    border: 'none',
                                                    cursor: 'pointer',
                                                    marginTop: '4px',
                                                    padding: 0
                                                }}
                                            >
                                                {t('profile.cancelSubscription')}
                                            </button>
                                        )}
                                    </div>
                                </div>

                                {!isPremium && (
                                    <div className="premium-upgrade-area">
                                        <h3 className="upgrade-title">{t('profile.premiumTitle')}</h3>
                                        <p className="upgrade-subtitle">
                                            <Trans
                                                i18nKey="profile.premiumSubtitle"
                                                components={{ highlight: <span className="highlight" /> }}
                                            />
                                        </p>
                                        <div className="subscription-options">
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
                        )}
                    </>
                )}
            </div>

            {/* Cancel Subscription Modal */}
            {
                showCancelModal && (
                    <div style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        backgroundColor: 'rgba(0,0,0,0.6)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 2000,
                        animation: 'fadeIn 0.3s ease-out'
                    }}>
                        <div className="auth-container" style={{
                            maxWidth: '320px',
                            padding: '1.5rem',
                            animation: 'popIn 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                            textAlign: 'center',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '1rem',
                            background: 'white',
                            borderRadius: '20px',
                            boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
                            position: 'relative'
                        }}>
                            <button
                                onClick={() => setShowCancelModal(false)}
                                style={{
                                    position: 'absolute',
                                    top: '16px',
                                    right: '16px',
                                    background: 'transparent',
                                    border: '3px solid #ccc',
                                    borderRadius: '12px',
                                    width: '40px',
                                    height: '40px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    cursor: 'pointer',
                                    fontSize: '1.5rem',
                                    color: '#999',
                                    boxShadow: '0 3px 0 #bbb',
                                    transition: 'all 0.1s ease',
                                    padding: 0,
                                    lineHeight: 1
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.transform = 'scale(1.05)';
                                    e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.05)';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.transform = 'scale(1)';
                                    e.currentTarget.style.backgroundColor = 'transparent';
                                }}
                                onMouseDown={(e) => {
                                    e.currentTarget.style.transform = 'translateY(2px) scale(1.05)';
                                    e.currentTarget.style.boxShadow = '0 1px 0 #bbb';
                                }}
                                onMouseUp={(e) => {
                                    e.currentTarget.style.transform = 'scale(1.05)';
                                    e.currentTarget.style.boxShadow = '0 3px 0 #bbb';
                                }}
                            >
                                ✕
                            </button>

                            {/* Header Emoji */}
                            <div style={{ fontSize: '3rem', marginBottom: '10px', marginTop: '10px' }}>😢</div>

                            <h3 style={{ margin: '0 0 8px 0', color: '#443', fontSize: '1.4rem', fontWeight: 800 }}>{t('profile.cancelConfirmTitle')}</h3>
                            <p style={{ margin: '0 0 24px 0', color: '#666', fontSize: '0.95rem', lineHeight: '1.5', whiteSpace: 'pre-line' }}>
                                {t('profile.cancelConfirmMessage')}
                            </p>

                            <button
                                onClick={handleCancelSubscription}
                                style={{
                                    width: '100%',
                                    background: 'linear-gradient(180deg, #ff6b6b 0%, #ee5253 100%)',
                                    color: 'white',
                                    border: 'none',
                                    padding: '16px',
                                    borderRadius: '16px',
                                    fontSize: '1.1rem',
                                    fontWeight: '800',
                                    cursor: 'pointer',
                                    boxShadow: '0 4px 0 #d32f2f, 0 5px 15px rgba(238, 82, 83, 0.4)',
                                    transform: 'translateY(0)',
                                    transition: 'all 0.1s ease',
                                    letterSpacing: '0.5px'
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.transform = 'translateY(-2px)';
                                    e.currentTarget.style.filter = 'brightness(1.1)';
                                    e.currentTarget.style.boxShadow = '0 6px 0 #d32f2f, 0 8px 20px rgba(238, 82, 83, 0.5)';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.transform = 'translateY(0)';
                                    e.currentTarget.style.filter = 'brightness(1)';
                                    e.currentTarget.style.boxShadow = '0 4px 0 #d32f2f, 0 5px 15px rgba(238, 82, 83, 0.4)';
                                }}
                                onMouseDown={(e) => {
                                    e.currentTarget.style.transform = 'translateY(4px)';
                                    e.currentTarget.style.boxShadow = '0 0 0 #d32f2f, 0 2px 5px rgba(238, 82, 83, 0.3)';
                                }}
                                onMouseUp={(e) => {
                                    e.currentTarget.style.transform = 'translateY(-2px)';
                                    e.currentTarget.style.boxShadow = '0 6px 0 #d32f2f, 0 8px 20px rgba(238, 82, 83, 0.5)';
                                }}
                            >
                                {t('common.confirm')}
                            </button>
                        </div>
                    </div>
                )
            }
        </div >
    );
};
