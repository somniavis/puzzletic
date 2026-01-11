import React from 'react';
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
    const handleConfirm = () => {
        playButtonSound();
        onConfirm();
    };

    const handleCancel = () => {
        playButtonSound();
        onCancel();
    };

    return (
        <div
            className="food-menu-overlay"
            onClick={(e) => {
                if (e.target === e.currentTarget) {
                    handleCancel();
                }
            }}
        >
            <div
                className="food-menu"
                style={{ maxWidth: '400px', height: 'auto', maxHeight: 'none' }}
                onClick={(e) => e.stopPropagation()}
                onTouchStart={(e) => e.stopPropagation()}
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
                            onClick={(e) => {
                                e.stopPropagation();
                                handleCancel();
                            }}
                            onTouchStart={(e) => {
                                e.stopPropagation();
                                handleCancel();
                            }}
                        >
                            <span className="action-label" style={{ fontSize: '1.1rem' }}>{cancelLabel}</span>
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
                            onClick={(e) => {
                                e.stopPropagation();
                                handleConfirm();
                            }}
                            onTouchStart={(e) => {
                                e.stopPropagation();
                                handleConfirm();
                            }}
                        >
                            <span className="action-label" style={{ fontSize: '1.1rem' }}>{confirmLabel}</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
