import React from 'react';
import { Check, Globe, Star } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTranslation, Trans } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import { useNurturing } from '../contexts/NurturingContext';
import { useMobileInteractionGuard } from '../hooks/useMobileInteractionGuard';
import { resolveBillingOfferType } from '../constants/billingPlans';
import { AppLoadingOverlay } from '../components/common/AppLoadingOverlay';
import './ProfilePage.css';

type ProfileTab = 'my_jello' | 'pass';

const createParentGateCode = () =>
    Array.from({ length: 3 }, () => Math.floor(Math.random() * 9) + 1);

const createUniqueImpactSeeds = () => {
    const pool = Array.from({ length: 20 }, (_, index) => index + 1);

    for (let index = pool.length - 1; index > 0; index -= 1) {
        const swapIndex = Math.floor(Math.random() * (index + 1));
        [pool[index], pool[swapIndex]] = [pool[swapIndex], pool[index]];
    }

    return pool.slice(0, 3);
};

export const ProfilePage: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { t, i18n } = useTranslation();
    const [showCancelModal, setShowCancelModal] = React.useState(false);
    const [activeTab, setActiveTab] = React.useState<ProfileTab>('my_jello');
    const [isPassUnlocked, setIsPassUnlocked] = React.useState(false);
    const [parentGateCode, setParentGateCode] = React.useState<number[]>(() => createParentGateCode());
    const [parentGateInput, setParentGateInput] = React.useState('');
    const [parentGateError, setParentGateError] = React.useState('');
    const { user, isAdmin } = useAuth();
    const {
        gro,
        xp,
        addRewards,
        maxStats,
        subscription,
        checkoutOverlay,
        closeCheckoutOverlay,
        purchasePlan,
        cancelSubscription,
        debugUnlockAllGames,
        debugAddStars,
    } = useNurturing();
    const showDebugMode = import.meta.env.DEV || isAdmin;
    const isPremium = subscription.isPremium;
    const isGuest = !user;
    const resolvedLanguage = i18n.resolvedLanguage || i18n.language;
    const passOfferType = resolveBillingOfferType(null, resolvedLanguage);
    const isDurationOffer = passOfferType === 'duration';
    const annualPassTitle = t(`profile.subscription.yearly.${passOfferType}Title`);
    const annualPassDesc = t(`profile.subscription.yearly.${passOfferType}Desc`);
    const quarterlyPassTitle = t(`profile.subscription.quarterly.${passOfferType}Title`);
    const quarterlyPassDesc = t(`profile.subscription.quarterly.${passOfferType}Desc`);
    const canCancelInService =
        subscription.plan === '3_months' ||
        subscription.plan === '12_months' ||
        subscription.plan === 'subscription_3_months' ||
        subscription.plan === 'subscription_12_months';
    const premiumStatusLabel = subscription.plan === '12_months' || subscription.plan === 'subscription_12_months'
        ? t('profile.status.angelPass')
        : subscription.plan === '3_months' || subscription.plan === 'subscription_3_months'
            ? t('profile.status.jelloPass')
            : t('profile.status.premium');
    const purchaseNote = passOfferType === 'subscription'
        ? t('profile.cancelAnytimeShort')
        : null;
    const isCheckoutBusy = checkoutOverlay.isPreparing || checkoutOverlay.isOpen;
    const rootRef = React.useRef<HTMLDivElement | null>(null);
    const impactImageSeeds = React.useMemo(
        () => createUniqueImpactSeeds(),
        [],
    );
    const parentGateWordSequence = parentGateCode
        .map((digit) => t(`profile.parentGate.numberWords.${digit}`))
        .join(',  ');

    useMobileInteractionGuard({ rootRef });

    React.useEffect(() => {
        if (!checkoutOverlay.isOpen) {
            return;
        }

        const originalOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';

        const handleEscape = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                closeCheckoutOverlay({ refresh: true });
            }
        };

        window.addEventListener('keydown', handleEscape);
        return () => {
            document.body.style.overflow = originalOverflow;
            window.removeEventListener('keydown', handleEscape);
        };
    }, [checkoutOverlay.isOpen, closeCheckoutOverlay]);

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
        const result = await cancelSubscription();
        if (result.success) {
            alert(t('profile.cancelSuccess', {
                defaultValue: 'Your cancellation request has been submitted.',
            }));
            setShowCancelModal(false);
            return;
        }

        if (result.message) {
            alert(result.message);
            return;
        }

        alert(t('profile.cancelFailure', {
            defaultValue: 'Unable to cancel the subscription right now. Please try again shortly.',
        }));
    };

    const handlePurchase = async (plan: '3_months' | '12_months') => {
        const success = await purchasePlan(plan);
        if (!success) {
            alert(t('profile.purchaseResult.failure'));
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
            const isMasterCode = nextInput === '999';

            if (nextInput === targetCode || isMasterCode) {
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
        <div ref={rootRef} className={`profile-page mobile-ui-guard ${activeTab === 'pass' ? 'profile-page-pass' : ''}`}>
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
                        <section className="profile-section profile-section-account">
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
                                    {isPremium ? premiumStatusLabel : t('profile.status.free')}
                                </span>
                                <div className="sub-info-left">
                                    <span className="sub-title">{t('profile.signedInAs')}</span>
                                    <span className="sub-desc">{user?.email || t('profile.guestUser')}</span>
                                    {isPremium && subscription.expiryDate && (
                                        <span className="sub-desc" style={{ fontSize: '0.8rem', opacity: 0.8 }}>
                                            {t('profile.expiresLabel')}: {new Date(subscription.expiryDate).toLocaleDateString()}
                                        </span>
                                    )}
                                </div>
                            </div>
                            {!isPremium && (
                                <button
                                    type="button"
                                    className="account-upgrade-btn"
                                    onClick={handlePassTabOpen}
                                >
                                    {t('profile.upgradePrompt')}
                                </button>
                            )}
                        </section>

                        <section className="profile-section profile-section-collection">
                            <div className="profile-panel-heading">
                                <h2>{t('profile.collectionLabel')}</h2>
                            </div>
                            <button className="jello-box-link" onClick={() => navigate('/jellobox')}>
                                📚 {t('profile.myJelloBox')}
                            </button>
                        </section>

                        {showDebugMode && (
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
                                                alert('Debug function not ready yet');
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
                                            alert('🚂 Train Queued! Go back to Pet Room.');
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
                                            if (confirm('Unlock ALL games for testing?')) {
                                                debugUnlockAllGames();
                                            }
                                        }}
                                    >
                                        🔓 Unlock All
                                    </button>
                                </div>
                            </section>
                        )}

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

                        {isPassUnlocked && isPremium && (
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
                                        {isPremium ? premiumStatusLabel : t('profile.status.free')}
                                    </span>
                                    <div className="sub-info-left">
                                        <span className="sub-title">{t('profile.signedInAs')}</span>
                                        <span className="sub-desc">{user?.email || t('profile.guestUser')}</span>
                                        {isPremium && subscription.expiryDate && (
                                            <span className="sub-desc" style={{ fontSize: '0.8rem', opacity: 0.8 }}>
                                                {t('profile.expiresLabel')}: {new Date(subscription.expiryDate).toLocaleDateString()}
                                            </span>
                                        )}
                                        {isPremium && canCancelInService && (
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
                            </section>
                        )}

                        {isPassUnlocked && !isPremium && (
                            <>
                                <section className="profile-copy-section">
                                    <div className="premium-upgrade-area">
                                        <h3 className="upgrade-title">{t('profile.premiumTitle')}</h3>
                                        <p className="upgrade-subtitle">
                                            <Trans
                                                i18nKey="profile.premiumSubtitle"
                                                components={{ highlight: <span className="highlight" /> }}
                                            />
                                        </p>
                                    </div>
                                </section>

                                {isDurationOffer ? (
                                    <>
                                        <section className="profile-section quarterly-pass-section featured-pass-section">
                                            <div className="pricing-option-panel">
                                                <div className="pricing-panel-head pricing-panel-head-basic">
                                                    <div>
                                                        <span className="pricing-kicker">{t('profile.badges.mostPopular')}</span>
                                                        <h4>{quarterlyPassTitle}</h4>
                                                        <p>{quarterlyPassDesc}</p>
                                                    </div>
                                                    <div className="pricing-price-stack">
                                                        <span className="pricing-price pricing-price-basic">$1.33</span>
                                                        <span className="pricing-unit pricing-unit-basic">{t('profile.subscription.unit')}</span>
                                                    </div>
                                                </div>

                                                <ul className="pricing-benefits pricing-benefits-basic">
                                                    <li>
                                                        <span className="pricing-benefit-dot">
                                                            <Check size={12} />
                                                        </span>
                                                        <span>{t('common.modal.benefit1')}</span>
                                                    </li>
                                                    <li>
                                                        <span className="pricing-benefit-dot">
                                                            <Check size={12} />
                                                        </span>
                                                        <span>{t('common.modal.benefit3')}</span>
                                                    </li>
                                                </ul>

                                                <button
                                                    type="button"
                                                    className="pricing-cta pricing-cta-angel"
                                                    onClick={() => handlePurchase('3_months')}
                                                    disabled={isCheckoutBusy}
                                                >
                                                    {t('profile.purchaseButton')}
                                                </button>
                                                {purchaseNote && (
                                                    <p className="pricing-cta-note">{purchaseNote}</p>
                                                )}
                                            </div>
                                        </section>

                                        <section className="profile-section annual-pass-section basic-pass-section">
                                            <div className="pricing-option-panel">
                                                <div className="pricing-panel-head">
                                                    <div className="pricing-chip-row pricing-chip-row-end">
                                                        <span className="pricing-chip pricing-chip-accent">
                                                            {t('profile.badges.recommended')}
                                                        </span>
                                                    </div>
                                                </div>

                                                <div className="pricing-panel-hero">
                                                    <h4 className="angel-pass-title">
                                                        <span>{annualPassTitle}</span>
                                                        <span className="angel-pass-wing-group" aria-hidden="true">
                                                            <span className="angel-pass-wing angel-pass-wing-left">🪽</span>
                                                            <span className="angel-pass-wing">🪽</span>
                                                        </span>
                                                    </h4>
                                                    <div className="pricing-price-line">
                                                        <span className="pricing-price">$1.00</span>
                                                        <span className="pricing-unit">{t('profile.subscription.unit')}</span>
                                                    </div>
                                                    <p>{annualPassDesc}</p>
                                                </div>

                                                <ul className="pricing-benefits">
                                                    <li>
                                                        <span className="pricing-benefit-icon">
                                                            <Check size={16} />
                                                        </span>
                                                        <span>{t('common.modal.benefit1')}</span>
                                                    </li>
                                                    <li>
                                                        <span className="pricing-benefit-icon pricing-benefit-icon-accent">
                                                            <Star size={16} />
                                                        </span>
                                                        <span className="pricing-benefit-strong">{t('common.modal.benefit3')}</span>
                                                    </li>
                                                    <li>
                                                        <span className="pricing-benefit-icon pricing-benefit-icon-accent">
                                                            <Globe size={16} />
                                                        </span>
                                                        <span className="pricing-benefit-strong pricing-benefit-highlight-soft">{t('common.modal.benefit2')}</span>
                                                    </li>
                                                </ul>

                                                <button
                                                    type="button"
                                                    className="pricing-cta pricing-cta-basic"
                                                    onClick={() => handlePurchase('12_months')}
                                                    disabled={isCheckoutBusy}
                                                >
                                                    {t('profile.purchaseButton')}
                                                </button>
                                                {purchaseNote && (
                                                    <p className="pricing-cta-note pricing-cta-note-basic">{purchaseNote}</p>
                                                )}
                                            </div>
                                        </section>
                                    </>
                                ) : (
                                    <>
                                <section className="profile-section annual-pass-section angel-pass-section">
                                    <div className="pricing-option-panel">
                                        <div className="pricing-panel-head">
                                            <div className="pricing-chip-row pricing-chip-row-end">
                                                <span className="pricing-chip pricing-chip-accent">
                                                    {t('profile.badges.recommended')}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="pricing-panel-hero">
                                            <h4 className="angel-pass-title">
                                                <span>{annualPassTitle}</span>
                                                <span className="angel-pass-wing-group" aria-hidden="true">
                                                    <span className="angel-pass-wing angel-pass-wing-left">🪽</span>
                                                    <span className="angel-pass-wing">🪽</span>
                                                </span>
                                            </h4>
                                            <div className="pricing-price-line">
                                                <span className="pricing-price">$1.00</span>
                                                <span className="pricing-unit">{t('profile.subscription.unit')}</span>
                                            </div>
                                            <p>{annualPassDesc}</p>
                                        </div>

                                        <ul className="pricing-benefits">
                                            <li>
                                                <span className="pricing-benefit-icon">
                                                    <Check size={16} />
                                                </span>
                                                <span>{t('common.modal.benefit1')}</span>
                                            </li>
                                            <li>
                                                <span className="pricing-benefit-icon pricing-benefit-icon-accent">
                                                    <Star size={16} />
                                                </span>
                                                <span className="pricing-benefit-strong">{t('common.modal.benefit3')}</span>
                                            </li>
                                            <li>
                                                <span className="pricing-benefit-icon pricing-benefit-icon-accent">
                                                    <Globe size={16} />
                                                </span>
                                                <span className="pricing-benefit-strong pricing-benefit-highlight-soft">{t('common.modal.benefit2')}</span>
                                            </li>
                                        </ul>

                                        <button
                                            type="button"
                                            className="pricing-cta pricing-cta-angel"
                                            onClick={() => handlePurchase('12_months')}
                                            disabled={isCheckoutBusy}
                                        >
                                            {t('profile.purchaseButton')}
                                        </button>
                                        {purchaseNote && (
                                            <p className="pricing-cta-note">{purchaseNote}</p>
                                        )}
                                    </div>
                                </section>

                                <section className="profile-section quarterly-pass-section jello-pass-section">
                                    <div className="pricing-option-panel">
                                        <div className="pricing-panel-head pricing-panel-head-basic">
                                            <div>
                                                <span className="pricing-kicker">{t('profile.badges.mostPopular')}</span>
                                                <h4>{quarterlyPassTitle}</h4>
                                                <p>{quarterlyPassDesc}</p>
                                            </div>
                                            <div className="pricing-price-stack">
                                                <span className="pricing-price pricing-price-basic">$1.33</span>
                                                <span className="pricing-unit pricing-unit-basic">{t('profile.subscription.unit')}</span>
                                            </div>
                                        </div>

                                        <ul className="pricing-benefits pricing-benefits-basic">
                                            <li>
                                                <span className="pricing-benefit-dot">
                                                    <Check size={12} />
                                                </span>
                                                <span>{t('common.modal.benefit1')}</span>
                                            </li>
                                            <li>
                                                <span className="pricing-benefit-dot">
                                                    <Check size={12} />
                                                </span>
                                                <span>{t('common.modal.benefit3')}</span>
                                            </li>
                                        </ul>

                                        <button
                                            type="button"
                                            className="pricing-cta pricing-cta-basic"
                                            onClick={() => handlePurchase('3_months')}
                                            disabled={isCheckoutBusy}
                                        >
                                            {t('profile.purchaseButton')}
                                        </button>
                                        {purchaseNote && (
                                            <p className="pricing-cta-note pricing-cta-note-basic">{purchaseNote}</p>
                                        )}
                                    </div>
                                </section>
                                    </>
                                )}
                            </>
                        )}

                        {isPassUnlocked && (
                            <section className="profile-section angel-pass-impact-card">
                                <div className="angel-pass-impact-copy">
                                    <span className="angel-pass-impact-label">{t('profile.impactCard.label')}</span>
                                    <p className="angel-pass-impact-title">{t('profile.impactCard.title')}</p>
                                </div>
                                <div className="angel-pass-impact-gallery" aria-hidden="true">
                                    <span className="angel-pass-impact-orb angel-pass-impact-orb-angel">👼</span>
                                    {impactImageSeeds.map((seed, index) => (
                                        <span
                                            key={`impact-orb-${seed}-${index}`}
                                            className={`angel-pass-impact-orb angel-pass-impact-orb-${index + 1}`}
                                        >
                                            <img
                                                src={`https://picsum.photos/seed/user${seed}/100/100`}
                                                alt=""
                                                loading="lazy"
                                                referrerPolicy="no-referrer"
                                            />
                                        </span>
                                    ))}
                                </div>
                            </section>
                        )}
                    </>
                )}
            </div>

            {checkoutOverlay.isPreparing && (
                <AppLoadingOverlay message={t('profile.checkoutPreparing')} zIndex={2400} />
            )}

            {checkoutOverlay.isOpen && checkoutOverlay.checkoutUrl && (
                <div className="xsolla-checkout-overlay" role="dialog" aria-modal="true" aria-label="Xsolla checkout">
                    <div className="xsolla-checkout-shell">
                        <div className="xsolla-checkout-header">
                            <div className="xsolla-checkout-copy">
                                <span className="xsolla-checkout-kicker">Secure Checkout</span>
                                <strong>{t('profile.checkoutTitle')}</strong>
                            </div>
                            <button
                                type="button"
                                className="xsolla-checkout-close"
                                onClick={() => closeCheckoutOverlay({ refresh: true })}
                                aria-label={t('common.close')}
                            >
                                ✕
                            </button>
                        </div>

                        <div className="xsolla-checkout-frame-wrap">
                            <iframe
                                src={checkoutOverlay.checkoutUrl}
                                title={t('profile.checkoutTitle')}
                                className="xsolla-checkout-frame"
                                allow="clipboard-read; clipboard-write; payment"
                            />
                        </div>
                    </div>
                </div>
            )}

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
