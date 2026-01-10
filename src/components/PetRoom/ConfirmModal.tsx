import React, { useCallback } from 'react';
import { playButtonSound } from '../../utils/sound';
import './PetRoom.css';

interface ConfirmModalProps {
    title: string;
    message: string;
    confirmLabel?: string;
    cancelLabel?: string;
    onConfirm: () => void;
    onCancel: () => void;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
    title,
    message,
    confirmLabel = 'Yes',
    cancelLabel = 'No',
    onConfirm,
    onCancel
}) => {
    // Use callback to prevent double invocation
    const handleConfirm = useCallback((e: React.MouseEvent | React.TouchEvent) => {
        e.stopPropagation();
        e.preventDefault();
        playButtonSound();
        onConfirm();
    }, [onConfirm]);

    const handleCancel = useCallback((e: React.MouseEvent | React.TouchEvent) => {
        e.stopPropagation();
        e.preventDefault();
        playButtonSound();
        onCancel();
    }, [onCancel]);

    const handleOverlayClick = useCallback((e: React.MouseEvent | React.TouchEvent) => {
        // Only trigger if the click/touch is directly on the overlay, not on children
        if (e.target === e.currentTarget) {
            playButtonSound();
            onCancel();
        }
    }, [onCancel]);

    return (
        <div
            className="food-menu-overlay"
            onClick={handleOverlayClick}
            onTouchEnd={handleOverlayClick}
            style={{ touchAction: 'none' }}
        >
            <div
                className="food-menu"
                style={{ maxWidth: '400px', height: 'auto', maxHeight: 'none', touchAction: 'manipulation' }}
                onClick={(e) => e.stopPropagation()}
                onTouchEnd={(e) => e.stopPropagation()}
            >
                <div className="food-menu-header">
                    <h3>{title}</h3>
                </div>
                <div style={{ padding: '2rem 1.5rem', textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                    <p style={{ fontSize: '1.2rem', fontWeight: '700', color: '#4d3e2f', whiteSpace: 'pre-line', lineHeight: '1.5', margin: 0 }}>{message}</p>
                    <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                        <button
                            className="action-btn"
                            style={{
                                width: 'auto',
                                padding: '0.8rem 2rem',
                                height: 'auto',
                                background: '#f0f0f0',
                                borderRadius: '24px',
                                border: '3px solid #ccc',
                                boxShadow: '0 4px 0 #999',
                                color: '#666',
                                touchAction: 'manipulation'
                            }}
                            onClick={handleCancel}
                            onTouchEnd={handleCancel}
                        >
                            <span className="action-label" style={{ fontSize: '1.1rem' }}>{cancelLabel}</span>
                        </button>
                        <button
                            className="action-btn action-btn--main"
                            style={{
                                width: 'auto',
                                padding: '0.8rem 2rem',
                                height: 'auto',
                                touchAction: 'manipulation'
                            }}
                            onClick={handleConfirm}
                            onTouchEnd={handleConfirm}
                        >
                            <span className="action-label" style={{ fontSize: '1.1rem' }}>{confirmLabel}</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
