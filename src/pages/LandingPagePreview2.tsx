import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTranslation } from 'react-i18next';
import { loadNurturingState, getStorageKey, getChecksumKey } from '../services/persistenceService';
import { useMobileInteractionGuard } from '../hooks/useMobileInteractionGuard';
import './LandingPagePreview2.css';

export const LandingPortalPage: React.FC = () => {
    const { loginAsGuest, user, guestId } = useAuth();
    const navigate = useNavigate();
    const { t } = useTranslation();
    const [hasActiveSession, setHasActiveSession] = React.useState(false);
    const rootRef = React.useRef<HTMLDivElement | null>(null);

    useMobileInteractionGuard({ rootRef });

    React.useEffect(() => {
        if (!guestId) {
            setHasActiveSession(false);
            console.log('[Landing] no guestId, active session cleared');
            return;
        }

        try {
            const savedState = loadNurturingState(guestId);
            console.log('[Landing] checked guest session', {
                guestId,
                hasCharacter: Boolean(savedState?.hasCharacter),
            });
            if (savedState && savedState.hasCharacter) {
                setHasActiveSession(true);
            } else {
                setHasActiveSession(false);
            }
        } catch (e) {
            console.warn('Failed to check guest session:', e);
            setHasActiveSession(false);
        }
    }, [guestId]);

    React.useEffect(() => {
        if (user) {
            console.log('[Landing] user detected, navigate -> /room', {
                uid: user.uid,
                email: user.email ?? null,
            });
            navigate('/room');
        }
    }, [user, navigate]);

    const handleStartExperience = () => {
        console.log('[Landing] handleStartExperience', {
            hasActiveSession,
            guestId,
        });
        loginAsGuest();
        console.log('[Landing] navigate -> /room from start experience');
        navigate('/room');
    };

    const handleNewGame = () => {
        console.log('[Landing] handleNewGame requested', { guestId });
        if (window.confirm(t('common.confirm_reset') || 'Are you sure you want to start a new game? Existing data will be lost.')) {
            if (guestId) {
                localStorage.removeItem(getStorageKey(guestId));
                localStorage.removeItem(getChecksumKey(guestId));
                localStorage.removeItem('puzzleletic_guest_id');
                console.log('[Landing] guest local data cleared for new game', { guestId });
            }
            loginAsGuest();
            console.log('[Landing] navigate -> /room from new game');
            navigate('/room');
        }
    };

    return (
        <div ref={rootRef} className="portal-landing mobile-ui-guard">
            <div className="portal-landing__aurora portal-landing__aurora--left" aria-hidden="true" />
            <div className="portal-landing__aurora portal-landing__aurora--right" aria-hidden="true" />
            <div className="portal-landing__math-layer" aria-hidden="true">
                <div className="portal-landing__math portal-landing__math--a">+</div>
                <div className="portal-landing__math portal-landing__math--b">−</div>
                <div className="portal-landing__math portal-landing__math--c">×</div>
                <div className="portal-landing__math portal-landing__math--d">÷</div>
                <div className="portal-landing__math portal-landing__math--e">+</div>
                <div className="portal-landing__math portal-landing__math--f">×</div>
                <div className="portal-landing__math portal-landing__math--g">÷</div>
                <div className="portal-landing__math portal-landing__math--h">−</div>
                <div className="portal-landing__math portal-landing__math--i">+</div>
                <div className="portal-landing__math portal-landing__math--j">×</div>
                <div className="portal-landing__math portal-landing__math--k">÷</div>
                <div className="portal-landing__math portal-landing__math--l">−</div>
            </div>

            <header className="portal-landing__header" />

            <main className="portal-landing__layout">
                <section className="portal-landing__slot portal-landing__slot--copy">
                    <div className="portal-landing__copy">
                        <p className="portal-landing__eyebrow">{t('landing.secret_invitation')}</p>
                        <h1 className="portal-landing__title">GroGroJello</h1>

                        <div className="portal-landing__chips" aria-hidden="true">
                            <span>{t('landing.portal_chip_raise')}</span>
                            <span>{t('landing.portal_chip_play')}</span>
                            <span>{t('landing.portal_chip_learn')}</span>
                        </div>
                    </div>
                </section>

                <section className="portal-landing__slot portal-landing__slot--visual">
                    <div className="portal-landing__visual" aria-hidden="true">
                        <div className="portal-ring portal-ring--outer" />
                        <div className="portal-ring portal-ring--mid" />
                        <div className="portal-ring portal-ring--inner" />
                        <button
                            type="button"
                            className="portal-core portal-core--button"
                            onClick={handleStartExperience}
                            aria-label={hasActiveSession ? t('landing.continue_experience') : t('landing.free_start')}
                        >
                            <div className="portal-world">
                                <div className="portal-world__sky" />
                                <div className="portal-world__hill portal-world__hill--back" />
                                <div className="portal-world__hill portal-world__hill--front" />
                                <div className="portal-world__gate" />
                                <div className="portal-world__egg">🥚</div>
                            </div>
                            <span className="portal-core__label">
                                {hasActiveSession ? t('landing.continue_experience') : t('landing.free_start')}
                            </span>
                        </button>
                        {hasActiveSession && (
                            <div className="portal-landing__visual-actions">
                                <button
                                    type="button"
                                    className="portal-landing__secondary-cta"
                                    onClick={handleNewGame}
                                >
                                    {t('landing.new_game')}
                                </button>
                            </div>
                        )}
                        <div className="portal-spark portal-spark--a">✦</div>
                        <div className="portal-spark portal-spark--b">✦</div>
                        <div className="portal-spark portal-spark--c">✦</div>
                    </div>
                </section>

                <section className="portal-landing__slot portal-landing__slot--footer">
                        <div className="portal-landing__footer">
                            <div className="portal-landing__auth portal-landing__auth--footer">
                                <button onClick={() => navigate('/login')} className="portal-landing__link">
                                    {t('landing.login')}
                                </button>
                                <button onClick={() => navigate('/signup')} className="portal-landing__link">
                                    {t('landing.signup')}
                                </button>
                            </div>
                        </div>
                </section>
            </main>
        </div>
    );
};

export const LandingPagePreview2 = LandingPortalPage;
