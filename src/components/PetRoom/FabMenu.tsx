import React from 'react';
import { useTranslation } from 'react-i18next';
import { playButtonSound } from '../../utils/sound';
import { useNurturing } from '../../contexts/NurturingContext';
import './PetRoom.css';

interface FabMenuProps {
    isFabOpen: boolean;
    setIsFabOpen: (isOpen: boolean) => void;
    toggleShopMenu: () => void;
    handleCameraClick: () => void;
    showGiftBox: boolean;
    isActionInProgress: boolean;
    onPremiumClick: () => void;
}

export const FabMenu: React.FC<FabMenuProps> = React.memo(({
    isFabOpen,
    setIsFabOpen,
    toggleShopMenu,
    handleCameraClick,
    showGiftBox,
    isActionInProgress,
    onPremiumClick,
}) => {
    const { t } = useTranslation();
    const nurturing = useNurturing();

    return (
        <div className="fab-menu-container">
            {/* Main FAB Toggle Button */}
            <button
                className="shop-btn-floating"
                onClick={() => {
                    playButtonSound();
                    setIsFabOpen(!isFabOpen);
                }}
                disabled={showGiftBox}
                title={isFabOpen ? t('common.close') : t('common.menu')}
            >
                <span
                    className="action-icon"
                    style={{
                        transition: 'transform 0.3s ease',
                        transform: isFabOpen ? 'rotate(45deg)' : 'rotate(0deg)',
                        color: '#8B4513',
                    }}
                >
                    ＋
                </span>
            </button>

            {/* Expanded Menu Items */}
            {isFabOpen && (
                <>
                    {/* Shop Button */}
                    <button
                        className="fab-menu-item"
                        onClick={toggleShopMenu}
                        disabled={isActionInProgress || showGiftBox}
                        title={t('shop.menu.title')}
                    >
                        <span className="action-icon">🛖</span>
                    </button>

                    {/* Camera Button */}
                    <button
                        className="fab-menu-item"
                        onClick={handleCameraClick}
                        disabled={isActionInProgress || showGiftBox}
                        title={t('actions.camera')}
                    >
                        <span className="action-icon">📷</span>
                    </button>

                    {/* Premium Purchase Button */}
                    {!nurturing.subscription.isPremium && !showGiftBox && (
                        <button
                            className="premium-btn-floating"
                            onClick={() => {
                                playButtonSound();
                                // navigate('/profile'); // Removed: using modal now
                                onPremiumClick();
                            }}
                            disabled={isActionInProgress}
                            title={t('profile.upgradePrompt')}
                        >
                            <span className="action-icon">🎁</span>
                            <span className="premium-label">{t('common.upgrade_btn_text')}</span>
                        </button>
                    )}
                </>
            )}
        </div>
    );
});
