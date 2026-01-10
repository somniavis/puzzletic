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
    const handledByTouchRef = useRef(false);

    const executeConfirm = (source: string) => {
        // Only execute once per interaction
        if (handledByTouchRef.current && source === 'click') {
            setDebugMessage('ℹ️ Click ignored (touch handled)');
            return;
        }

        if (source === 'touch') {
            handledByTouchRef.current = true;
            // Reset after a delay
            setTimeout(() => {
                handledByTouchRef.current = false;
            }, 500);
        }

        setDebugMessage(`🚀 Sleep via ${source}!`);
        playButtonSound();
        onConfirm(); // Call immediately, no delay
    };

    const executeCancel = (source: string) => {
        if (handledByTouchRef.current && source === 'click') {
            return;
        }

        if (source === 'touch') {
            handledByTouchRef.current = true;
            setTimeout(() => {
                handledByTouchRef.current = false;
            }, 500);
        }

        playButtonSound();
        onCancel();
    };

    return (
        <div
            className="food-menu-overlay"
            onClick={(e) => {
                if (e.target === e.currentTarget) {
                    executeCancel('overlay');
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
                <div style={{ padding: '2rem 1.5rem', textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <p style={{ fontSize: '1.2rem', fontWeight: '700', color: '#4d3e2f', whiteSpace: 'pre-line', lineHeight: '1.5', margin: 0 }}>{message}</p>

                    {/* Debug display */}
                    <div style={{
                        padding: '0.75rem',
                        background: '#d1ecf1',
                        borderRadius: '12px',
                        fontSize: '0.95rem',
                        fontWeight: 'bold',
                        color: '#0c5460',
                        border: '2px solid #17a2b8'
                    }}>
                        {debugMessage}
                    </div>

                    <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                        {/* No Button */}
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
                                executeCancel('click');
                            }}
                            onTouchStart={(e) => {
                                e.stopPropagation();
                                executeCancel('touch');
                            }}
                        >
                            {cancelLabel}
                        </div>

                        {/* Yes Button */}
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
                                executeConfirm('click');
                            }}
                            onTouchStart={(e) => {
                                e.stopPropagation();
                                executeConfirm('touch');
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
