import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { playButtonSound } from '../../utils/sound';
import { PixelModalShell } from '../common/PixelModalShell';
import './PremiumPurchaseModal.css';

interface PremiumPurchaseModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const PremiumPurchaseModal: React.FC<PremiumPurchaseModalProps> = ({ isOpen, onClose }) => {
    const navigate = useNavigate();
    const { t } = useTranslation();

    if (!isOpen) return null;

    return (
        <PixelModalShell
            title={t('profile.status.angelPass')}
            onClose={() => {
                playButtonSound();
                onClose();
            }}
            className="pr-modal--premium premium-purchase-modal"
        >
            <div className="premium-purchase-modal__content">
                <div className="premium-purchase-modal__hero" aria-hidden="true">🌍</div>
                <h2 className="premium-purchase-modal__title">{`one for you,\none for a friend in need.`}</h2>

                <div className="premium-purchase-modal__benefits">
                    <div className="premium-purchase-modal__benefit">
                        ✅ <b>{t('common.modal.benefit1')}</b>
                    </div>
                    <div className="premium-purchase-modal__benefit">
                        ✅ <b>{t('common.modal.benefit2')}</b>
                    </div>
                    <div className="premium-purchase-modal__benefit">
                        ✅ <b>{t('common.modal.benefit3')}</b>
                    </div>
                </div>
            </div>

            <div className="premium-purchase-modal__footer">
                <button
                    className="premium-purchase-modal__cta"
                    onClick={() => {
                        playButtonSound();
                        onClose();
                        navigate('/profile?tab=pass');
                    }}
                >
                    {t('common.upgrade_btn_text')} ✨
                </button>
            </div>
        </PixelModalShell>
    );
};
