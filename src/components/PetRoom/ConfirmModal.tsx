import React, { useRef, useState } from 'react';
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
    const [debugMessage, setDebugMessage] = useState<string>('Ready');
    const isProcessingRef = useRef(false);

    const handleConfirm = () => {
        setDebugMessage('✨ YES TOUCHED!');

        if (isProcessingRef.current) {
            setDebugMessage('⚠️ Double tap blocked');
            return;
        }
        isProcessingRef.current = true;

        playButtonSound();

        setTimeout(() => {
            setDebugMessage('🚀 Calling sleep...');
            onConfirm();
        }, 200);

        setTimeout(() => {
            isProcessingRef.current = false;
        }, 1500);
    };

    const handleCancel = () => {
        setDebugMessage('❌ NO TOUCHED!');

        if (isProcessingRef.current) return;
        isProcessingRef.current = true;

        playButtonSound();

        setTimeout(() => {
            onCancel();
        }, 200);

        setTimeout(() => {
            isProcessingRef.current = false;
        }, 1500);
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
            >
                <div className="food-menu-header">
                    <h3>{title}</h3>
                </div>
                <div style={{ padding: '2rem 1.5rem', textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <p style={{ fontSize: '1.2rem', fontWeight: '700', color: '#4d3e2f', whiteSpace: 'pre-line', lineHeight: '1.5', margin: 0 }}>{message}</p>

                    {/* Debug display */}
                    <div style={{
                        padding: '0.75rem',
                        background: '#fff3cd',
                        borderRadius: '12px',
                        fontSize: '1rem',
                        fontWeight: 'bold',
                        color: '#856404',
                        border: '2px solid #ffc107'
                    }}>
                        Debug: {debugMessage}
                    </div>

                    <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                        {/* No Button */}
                        <div
                            role="button"
                            tabIndex={0}
                            style={{
                                padding: '1.2rem 2.5rem',
                                background: 'linear-gradient(180deg, #e0e0e0 0%, #c0c0c0 100%)',
                                borderRadius: '24px',
                                border: '4px solid #888',
                                boxShadow: '0 5px 0 #666',
                                color: '#333',
                                cursor: 'pointer',
                                fontSize: '1.3rem',
                                fontWeight: 700,
                                userSelect: 'none',
                                WebkitUserSelect: 'none'
                            }}
                            onClick={handleCancel}
                            onTouchStart={(e) => {
                                e.stopPropagation();
                                setDebugMessage('👆 No touched!');
                            }}
                            onTouchEnd={(e) => {
                                e.stopPropagation();
                                e.preventDefault();
                                handleCancel();
                            }}
                        >
                            {cancelLabel}
                        </div>

                        {/* Yes Button */}
                        <div
                            role="button"
                            tabIndex={0}
                            style={{
                                padding: '1.2rem 2.5rem',
                                background: 'linear-gradient(180deg, #FFD700 0%, #FFA500 100%)',
                                borderRadius: '24px',
                                border: '5px solid #d4961f',
                                boxShadow: '0 6px 0 #b4761f',
                                cursor: 'pointer',
                                fontSize: '1.3rem',
                                fontWeight: 700,
                                color: '#4d3e2f',
                                userSelect: 'none',
                                WebkitUserSelect: 'none'
                            }}
                            onClick={handleConfirm}
                            onTouchStart={(e) => {
                                e.stopPropagation();
                                setDebugMessage('👆 Yes touched!');
                            }}
                            onTouchEnd={(e) => {
                                e.stopPropagation();
                                e.preventDefault();
                                handleConfirm();
                            }}
                        >
                            {confirmLabel}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
