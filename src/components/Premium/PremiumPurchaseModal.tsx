import React from 'react';
import { useNavigate } from 'react-router-dom';
import { playButtonSound } from '../../utils/sound';

interface PremiumPurchaseModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const PremiumPurchaseModal: React.FC<PremiumPurchaseModalProps> = ({ isOpen, onClose }) => {
    const navigate = useNavigate();

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
                    borderRadius: '24px',
                    padding: '32px 24px',
                    position: 'relative',
                    textAlign: 'center',
                    border: '2px solid #FFD700',
                    boxShadow: '0 0 30px rgba(255, 215, 0, 0.3)',
                    color: '#fff'
                }}
            >
                {/* Close Button */}
                <button
                    onClick={() => {
                        playButtonSound();
                        onClose();
                    }}
                    style={{
                        position: 'absolute',
                        top: '16px',
                        right: '16px',
                        background: 'rgba(255, 255, 255, 0.1)',
                        border: 'none',
                        borderRadius: '50%',
                        width: '32px',
                        height: '32px',
                        color: '#fff',
                        fontSize: '18px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}
                >
                    ✕
                </button>

                {/* Header */}
                <div style={{ fontSize: '3rem', marginBottom: '16px' }}>💎</div>

                <h2 style={{
                    fontSize: '1.8rem',
                    marginBottom: '8px',
                    background: 'linear-gradient(to right, #FFD700, #FDB931)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    fontWeight: 800
                }}>
                    Unlock Premium!
                </h2>

                <p style={{
                    fontSize: '1rem',
                    opacity: 0.9,
                    marginBottom: '24px',
                    lineHeight: '1.5'
                }}>
                    This game is available for <b>Premium Users only</b>.<br />
                    Start growing <b>3x faster</b> now! 🚀
                </p>

                {/* Benefits List */}
                <div style={{
                    background: 'rgba(255, 255, 255, 0.05)',
                    borderRadius: '16px',
                    padding: '16px',
                    marginBottom: '24px',
                    textAlign: 'left'
                }}>
                    <div style={{ padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                        ✅ <b>Unlock ALL 20+ Games</b>
                    </div>
                    <div style={{ padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                        ✅ <b>Earn 3x-8x More XP</b>
                    </div>
                    <div style={{ padding: '8px 0' }}>
                        ✅ <b>Exclusive Jello Evolutions</b>
                    </div>
                </div>

                {/* Action Button */}
                <button
                    onClick={() => {
                        playButtonSound();
                        onClose();
                        navigate('/profile');
                    }}
                    style={{
                        background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)',
                        color: '#000',
                        border: 'none',
                        width: '100%',
                        padding: '16px',
                        borderRadius: '16px',
                        fontSize: '1.1rem',
                        fontWeight: 'bold',
                        cursor: 'pointer',
                        boxShadow: '0 4px 15px rgba(255, 165, 0, 0.4)',
                        transform: 'translateY(0)',
                        transition: 'transform 0.1s'
                    }}
                >
                    Upgrade Now ✨
                </button>
            </div>
        </div>
    );
};
