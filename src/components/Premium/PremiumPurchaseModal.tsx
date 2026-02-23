import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation, Trans } from 'react-i18next';
import { playButtonSound } from '../../utils/sound';

interface PremiumPurchaseModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const PremiumPurchaseModal: React.FC<PremiumPurchaseModalProps> = ({ isOpen, onClose }) => {
    const navigate = useNavigate();
    const { t } = useTranslation();

    if (!isOpen) return null;

    const handleBackdropClick = (e: React.MouseEvent) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    return (
        <div
            className="modal-overlay"
            onClick={handleBackdropClick}
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: 'rgba(0, 0, 0, 0.8)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 9999,
                animation: 'fadeIn 0.2s ease-out'
            }}
        >
            <div
                className="modal-content"
                style={{
                    background: 'linear-gradient(180deg, #1a1a2e 0%, #16213e 100%)',
                    width: '90%',
                    maxWidth: '400px',
                    maxHeight: '90vh',
                    display: 'flex',
                    flexDirection: 'column',
                    overflow: 'hidden', // Parent handles clipping, no scrolling
                    borderRadius: '24px',
                    padding: 0, // Padding moved to inner containers
                    position: 'relative',
                    textAlign: 'center',
                    border: '2px solid #FFD700',
                    boxShadow: '0 0 30px rgba(255, 215, 0, 0.3)',
                    color: '#fff'
                }}
            >
                {/* Close Button (Fixed) */}
                <button
                    onClick={() => {
                        playButtonSound();
                        onClose();
                    }}
                    style={{
                        position: 'absolute',
                        top: '16px',
                        right: '16px',
                        zIndex: 10,
                        background: 'transparent',
                        border: '3px solid #FFD700',
                        borderRadius: '12px',
                        width: '40px',
                        height: '40px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        fontSize: '1.5rem',
                        color: '#FFD700',
                        boxShadow: '0 3px 0 rgba(255, 215, 0, 0.3)',
                        transition: 'all 0.1s ease',
                        padding: 0,
                        lineHeight: 1,
                        WebkitTapHighlightColor: 'transparent',
                        WebkitTouchCallout: 'none',
                        WebkitUserSelect: 'none',
                        userSelect: 'none'
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'scale(1.05)';
                        e.currentTarget.style.backgroundColor = 'rgba(255, 215, 0, 0.1)';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'scale(1)';
                        e.currentTarget.style.backgroundColor = 'transparent';
                    }}
                    onMouseDown={(e) => {
                        e.currentTarget.style.transform = 'translateY(2px) scale(1.05)';
                        e.currentTarget.style.boxShadow = '0 1px 0 rgba(255, 215, 0, 0.3)';
                    }}
                    onMouseUp={(e) => {
                        e.currentTarget.style.transform = 'scale(1.05)';
                        e.currentTarget.style.boxShadow = '0 3px 0 rgba(255, 215, 0, 0.3)';
                    }}
                >
                    ✕
                </button>

                {/* Header Emoji (Fixed Top-Center) */}
                <div style={{
                    position: 'absolute',
                    top: '16px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    zIndex: 10,
                    fontSize: '2.5rem',
                    lineHeight: 1
                }}>
                    🌍
                </div>

                {/* Scrollable Content Area */}
                <div style={{
                    flex: 1,
                    overflowY: 'auto',
                    padding: '68px 20px 0', // Reduced top padding (Halved gap)
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center'
                }}>
                    {/* Title */}

                    <h2 style={{
                        fontSize: '1.5rem',
                        marginBottom: '8px',
                        background: 'linear-gradient(to right, #FFD700, #FDB931)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        fontWeight: 800,
                        whiteSpace: 'pre-line' // Allow newlines in title
                    }}>
                        {t('common.modal.title')}
                    </h2>

                    <p style={{
                        fontSize: '1rem',
                        opacity: 0.9,
                        marginBottom: '24px',
                        lineHeight: '1.5'
                    }}>
                        <Trans
                            i18nKey="common.modal.desc"
                            components={{ bold: <b />, br: <br /> }}
                        />
                    </p>

                    {/* Benefits List */}
                    <div style={{
                        background: 'rgba(255, 255, 255, 0.05)',
                        borderRadius: '16px',
                        padding: '16px',
                        marginBottom: '24px',
                        textAlign: 'left',
                        width: '100%'
                    }}>
                        <div style={{ padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                            ✅ <b>{t('common.modal.benefit1')}</b>
                        </div>
                        <div style={{ padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                            ✅ <b>{t('common.modal.benefit2')}</b>
                        </div>
                        <div style={{ padding: '8px 0' }}>
                            ✅ <b>{t('common.modal.benefit3')}</b>
                        </div>
                    </div>
                </div>

                {/* Footer Action Button (Fixed) */}
                <div style={{
                    flexShrink: 0,
                    padding: '0 20px 24px',
                    background: 'transparent', // Gradient from parent shows through
                    marginTop: 'auto'
                }}>
                    <button
                        onClick={() => {
                            playButtonSound();
                            onClose();
                            navigate('/profile');
                        }}
                        style={{
                            background: 'linear-gradient(180deg, #FFD700 0%, #FFA500 100%)',
                            color: '#4d3e2f',
                            border: '3px solid #d4961f',
                            width: '100%',
                            padding: '16px',
                            borderRadius: '16px',
                            fontSize: '1.2rem',
                            fontWeight: '800',
                            cursor: 'pointer',
                            boxShadow: '0 4px 0 #b4761f, 0 5px 15px rgba(255, 165, 0, 0.6)', // 3D Solid + Glow
                            transform: 'translateY(0)',
                            transition: 'all 0.1s ease',
                            textTransform: 'uppercase',
                            letterSpacing: '0.5px',
                            WebkitTapHighlightColor: 'transparent',
                            WebkitTouchCallout: 'none',
                            WebkitUserSelect: 'none',
                            userSelect: 'none'
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'translateY(-2px)';
                            e.currentTarget.style.filter = 'brightness(1.1)';
                            e.currentTarget.style.boxShadow = '0 6px 0 #b4761f, 0 8px 20px rgba(255, 165, 0, 0.7)'; // Enhanced glow on hover
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.filter = 'brightness(1)';
                            e.currentTarget.style.boxShadow = '0 4px 0 #b4761f, 0 5px 15px rgba(255, 165, 0, 0.6)'; // Return to normal
                        }}
                        onMouseDown={(e) => {
                            e.currentTarget.style.transform = 'translateY(4px)';
                            e.currentTarget.style.boxShadow = '0 0 0 #b4761f, 0 2px 5px rgba(255, 165, 0, 0.4)'; // Pressed: No 3D, reduced glow
                        }}
                        onMouseUp={(e) => {
                            e.currentTarget.style.transform = 'translateY(-2px)';
                            e.currentTarget.style.boxShadow = '0 6px 0 #b4761f, 0 8px 20px rgba(255, 165, 0, 0.7)'; // Release to hover state
                        }}
                    >
                        {t('common.upgrade_btn_text')} ✨
                    </button>
                </div>
            </div>
        </div>
    );
};
