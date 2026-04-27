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
            title={t('common.modal.title')}
            onClose={() => {
                playButtonSound();
                onClose();
            }}
            className="pr-modal--premium premium-purchase-modal"
            headerStart={<span aria-hidden="true" style={{ fontSize: '2rem', lineHeight: 1 }}>🌍</span>}
        >
            <div className="premium-purchase-modal__content">
                <h2 className="premium-purchase-modal__title">{t('common.modal.title')}</h2>

                <div className="premium-purchase-modal__badge">
                    {t('profile.status.angelPass')}
                </div>

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
