import React, { useRef } from 'react';
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
    // Prevent double triggering
    const isProcessingRef = useRef(false);

    const handleConfirm = () => {
        if (isProcessingRef.current) return;
        isProcessingRef.current = true;

        console.log('🔵 ConfirmModal: handleConfirm triggered');
        playButtonSound();
        onConfirm();

        // Reset after a delay
        setTimeout(() => {
            isProcessingRef.current = false;
        }, 1000);
    };

    const handleCancel = () => {
        if (isProcessingRef.current) return;
        isProcessingRef.current = true;

        console.log('🔴 ConfirmModal: handleCancel triggered');
        playButtonSound();
        onCancel();

        setTimeout(() => {
            isProcessingRef.current = false;
        }, 1000);
    };

    const handleOverlayClick = (e: React.MouseEvent | React.PointerEvent) => {
        if (e.target === e.currentTarget) {
            handleCancel();
        }
    };

    return (
        <div
            className="food-menu-overlay"
            onPointerDown={handleOverlayClick}
            style={{ touchAction: 'none' }}
        >
            <div
                className="food-menu"
                style={{ maxWidth: '400px', height: 'auto', maxHeight: 'none' }}
                onPointerDown={(e) => e.stopPropagation()}
            >
                <div className="food-menu-header">
                    <h3>{title}</h3>
                </div>
                <div style={{ padding: '2rem 1.5rem', textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                    <p style={{ fontSize: '1.2rem', fontWeight: '700', color: '#4d3e2f', whiteSpace: 'pre-line', lineHeight: '1.5', margin: 0 }}>{message}</p>
                    <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                        <button
                            type="button"
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
                                cursor: 'pointer'
                            }}
                            onPointerDown={(e) => {
                                e.stopPropagation();
                                handleCancel();
                            }}
                        >
                            <span style={{ fontSize: '1.1rem', fontWeight: 700, pointerEvents: 'none' }}>{cancelLabel}</span>
                        </button>
                        <button
                            type="button"
                            className="action-btn action-btn--main"
                            style={{
                                width: 'auto',
                                padding: '0.8rem 2rem',
                                height: 'auto',
                                cursor: 'pointer'
                            }}
                            onPointerDown={(e) => {
                                e.stopPropagation();
                                handleConfirm();
                            }}
                        >
                            <span style={{ fontSize: '1.1rem', fontWeight: 700, pointerEvents: 'none' }}>{confirmLabel}</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
