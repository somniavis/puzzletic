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

    const executeConfirm = () => {
        if (isProcessingRef.current) {
            setDebugMessage('⚠️ Double tap blocked');
            return;
        }
        isProcessingRef.current = true;

        setDebugMessage('✅ EXECUTING SLEEP!');
        playButtonSound();

        // Call onConfirm after a tiny delay to show the message
        setTimeout(() => {
            onConfirm();
        }, 150);

        setTimeout(() => {
            isProcessingRef.current = false;
        }, 2000);
    };

    const executeCancel = () => {
        if (isProcessingRef.current) return;
        isProcessingRef.current = true;

        setDebugMessage('❌ Cancelling...');
        playButtonSound();

        setTimeout(() => {
            onCancel();
        }, 150);

        setTimeout(() => {
            isProcessingRef.current = false;
        }, 2000);
    };

    return (
        <div
            className="food-menu-overlay"
            onClick={(e) => {
                if (e.target === e.currentTarget) {
                    executeCancel();
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
                        background: '#d4edda',
                        borderRadius: '12px',
                        fontSize: '1rem',
                        fontWeight: 'bold',
                        color: '#155724',
                        border: '2px solid #28a745'
                    }}>
                        {debugMessage}
                    </div>

                    <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                        {/* No Button - fires on touch START */}
                        <div
                            role="button"
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
                                WebkitUserSelect: 'none',
                                WebkitTouchCallout: 'none'
                            }}
                            onClick={(e) => {
                                e.stopPropagation();
                                executeCancel();
                            }}
                            onTouchStart={(e) => {
                                e.stopPropagation();
                                executeCancel();
                            }}
                        >
                            {cancelLabel}
                        </div>

                        {/* Yes Button - fires on touch START */}
                        <div
                            role="button"
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
                                WebkitUserSelect: 'none',
                                WebkitTouchCallout: 'none'
                            }}
                            onClick={(e) => {
                                e.stopPropagation();
                                executeConfirm();
                            }}
                            onTouchStart={(e) => {
                                e.stopPropagation();
                                executeConfirm();
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
