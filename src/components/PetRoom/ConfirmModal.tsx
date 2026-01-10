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
    // Debug state - shows what's happening
    const [debugMessage, setDebugMessage] = useState<string>('');

    // Prevent double triggering
    const isProcessingRef = useRef(false);

    const handleConfirm = () => {
        // Visual feedback for debugging
        setDebugMessage('✨ Yes pressed!');

        if (isProcessingRef.current) {
            setDebugMessage('⚠️ Already processing');
            return;
        }
        isProcessingRef.current = true;

        console.log('🔵 ConfirmModal: handleConfirm triggered');
        playButtonSound();

        // Small delay to show the message, then call onConfirm
        setTimeout(() => {
            setDebugMessage('🚀 Calling onConfirm...');
            onConfirm();
        }, 100);

        setTimeout(() => {
            isProcessingRef.current = false;
        }, 1000);
    };

    const handleCancel = () => {
        setDebugMessage('❌ No pressed!');

        if (isProcessingRef.current) return;
        isProcessingRef.current = true;

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
                <div style={{ padding: '2rem 1.5rem', textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <p style={{ fontSize: '1.2rem', fontWeight: '700', color: '#4d3e2f', whiteSpace: 'pre-line', lineHeight: '1.5', margin: 0 }}>{message}</p>

                    {/* Debug message display */}
                    {debugMessage && (
                        <div style={{
                            padding: '0.5rem',
                            background: '#ffe4b5',
                            borderRadius: '8px',
                            fontSize: '0.9rem',
                            fontWeight: 'bold',
                            color: '#8b4513'
                        }}>
                            {debugMessage}
                        </div>
                    )}

                    <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                        <button
                            type="button"
                            style={{
                                width: 'auto',
                                padding: '1rem 2.5rem',
                                height: 'auto',
                                background: '#e0e0e0',
                                borderRadius: '24px',
                                border: '3px solid #999',
                                boxShadow: '0 4px 0 #666',
                                color: '#333',
                                cursor: 'pointer',
                                fontSize: '1.2rem',
                                fontWeight: 700,
                                WebkitTapHighlightColor: 'rgba(0,0,0,0.1)'
                            }}
                            onPointerDown={(e) => {
                                e.stopPropagation();
                                handleCancel();
                            }}
                        >
                            {cancelLabel}
                        </button>
                        <button
                            type="button"
                            style={{
                                width: 'auto',
                                padding: '1rem 2.5rem',
                                height: 'auto',
                                background: 'linear-gradient(180deg, #FFD700 0%, #FFA500 100%)',
                                borderRadius: '24px',
                                border: '5px solid #d4961f',
                                boxShadow: '0 6px 0 #b4761f',
                                cursor: 'pointer',
                                fontSize: '1.2rem',
                                fontWeight: 700,
                                color: '#4d3e2f',
                                WebkitTapHighlightColor: 'rgba(0,0,0,0.1)'
                            }}
                            onPointerDown={(e) => {
                                e.stopPropagation();
                                handleConfirm();
                            }}
                        >
                            {confirmLabel}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
