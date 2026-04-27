import React from 'react';
import { useTranslation } from 'react-i18next';
import './PremiumLockOverlay.css';

interface PremiumLockOverlayProps {
    variant?: 'default' | 'food';
    onClick?: () => void;
}

export const PremiumLockOverlay: React.FC<PremiumLockOverlayProps> = ({ variant = 'default', onClick }) => {
    const { t } = useTranslation();
    const isFoodVariant = variant === 'food';

    return (
        <div
            className={`premium-lock-overlay ${isFoodVariant ? 'premium-lock-overlay--food' : ''}`.trim()}
        >
            {onClick && (
                <button
                    type="button"
                    aria-label={t('common.upgrade_btn_text')}
                    onClick={onClick}
                    className="premium-lock-overlay__button"
                />
            )}
            <div className={`premium-lock-overlay__icon ${isFoodVariant ? 'premium-lock-overlay__icon--food' : ''}`.trim()}>
                🔒
            </div>
            <div className="premium-lock-overlay__badge">
                {t('profile.status.angelPass')}
            </div>
        </div>
    );
};
