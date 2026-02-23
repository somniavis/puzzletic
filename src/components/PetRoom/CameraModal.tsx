import React, { useState } from 'react';
import { playButtonSound } from '../../utils/sound';
import { useTranslation } from 'react-i18next';
import './PetRoom.css'; // Reusing PetRoom styles for modal overlay

// Loading Spinner Component (Internal)
const LoadingSpinner = () => {
    const { t } = useTranslation();
    return (
        <div className="loading-spinner-container" style={{ margin: '2rem 0' }}>
            <div className="loading-spinner">🐾</div>
            <div className="loading-text">{t('camera.capturing')}</div>
        </div>
    );
};

interface CameraModalProps {
    imageDataUrl: string | null;
    shareUrl: string;
    onClose: () => void;
    isLoading?: boolean;
}

export const CameraModal: React.FC<CameraModalProps> = ({
    imageDataUrl,
    shareUrl,
    onClose,
    isLoading = false
}) => {
    const { t } = useTranslation();
    const [copyFeedback, setCopyFeedback] = useState<string | null>(null);

    const handleDownload = () => {
        if (!imageDataUrl) return;
        playButtonSound();
        const link = document.createElement('a');
        link.href = imageDataUrl;
        link.download = `puzzleletic-pet-${Date.now()}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleCopyLink = async () => {
        if (!shareUrl) return;
        playButtonSound();

        const copyToClipboardFallback = (text: string) => {
            const textArea = document.createElement("textarea");
            textArea.value = text;

            // Avoid scrolling to bottom
            textArea.style.top = "0";
            textArea.style.left = "0";
            textArea.style.position = "fixed";
            textArea.style.opacity = "0";

            document.body.appendChild(textArea);
            textArea.focus();
            textArea.select();

            try {
                const successful = document.execCommand('copy');
                if (successful) {
                    setCopyFeedback(t('share.linkCopied'));
                } else {
                    throw new Error('Fallback copy failed');
                }
            } catch (err) {
                console.error('Fallback: Oops, unable to copy', err);
                setCopyFeedback(t('share.copyFailed'));
            }

            document.body.removeChild(textArea);
            setTimeout(() => setCopyFeedback(null), 2000);
        };

        if (navigator.clipboard && navigator.clipboard.writeText) {
            try {
                await navigator.clipboard.writeText(shareUrl);
                setCopyFeedback(t('share.linkCopied'));
                setTimeout(() => setCopyFeedback(null), 2000);
            } catch (err) {
                console.warn('Clipboard API failed, trying fallback:', err);
                copyToClipboardFallback(shareUrl);
            }
        } else {
            copyToClipboardFallback(shareUrl);
        }
    };

    const handleClose = () => {
        playButtonSound();
        onClose();
    };

    return (
        <div
            className="food-menu-overlay camera-modal-overlay"
            style={{ zIndex: 1000 }}
            onClick={(e) => {
                if (e.target === e.currentTarget) handleClose();
            }}
        >
            <div
                className="food-menu"
                style={{
                    maxWidth: '450px',
                    width: '90%',
                    height: 'auto',
                    maxHeight: '90vh',
                    padding: '0',
                    display: 'flex',
                    flexDirection: 'column',
                    overflow: 'hidden'
                }}
                onClick={(e) => e.stopPropagation()}
            >
                <div className="food-menu-header">
                    <h3>{t('camera.title')}</h3>
                    <button
                        className="close-btn"
                        onClick={handleClose}
                    >
                        ✕
                    </button>
                </div>

                <div style={{
                    padding: '1.5rem',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '0.75rem',
                    overflowY: 'auto'
                }}>
                    {/* Image Preview or Loading State */}
                    <div style={{
                        width: '100%',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        minHeight: '200px', // Minimum height for loading state
                        background: '#f0e6d2', // Light beige background for better contrast
                        borderRadius: '12px',
                        padding: '10px',
                        border: '4px solid #8B4513',
                        boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.1)'
                    }}>
                        {isLoading || !imageDataUrl ? (
                            <LoadingSpinner />
                        ) : (
                            <img
                                src={imageDataUrl}
                                alt="Captured Pet Room"
                                style={{
                                    maxHeight: '50vh', // Limit height to ensure visibility without excessive scrolling
                                    maxWidth: '100%',
                                    width: 'auto',
                                    height: 'auto',
                                    display: 'block',
                                    borderRadius: '8px',
                                    boxShadow: '0 4px 8px rgba(0,0,0,0.2)'
                                }}
                            />
                        )}
                    </div>

                    <div style={{ width: '100%', display: 'flex', flexDirection: 'row', gap: '10px' }}>
                        {/* Download Button */}
                        <button
                            className="action-btn"
                            disabled={isLoading || !imageDataUrl}
                            style={{
                                flex: 1,
                                height: '60px',
                                flexDirection: 'row',
                                gap: '8px',
                                background: 'linear-gradient(180deg, #4CAF50 0%, #388E3C 100%)',
                                borderColor: '#2E7D32',
                                border: '3px solid #1b5e20',
                                borderRadius: '12px',
                                boxShadow: '0 4px 0 #1b5e20, 0 6px 10px rgba(0, 0, 0, 0.2)',
                                opacity: isLoading ? 0.6 : 1,
                                cursor: isLoading ? 'not-allowed' : 'pointer',
                                filter: isLoading ? 'grayscale(0.5)' : 'none'
                            }}
                            onClick={handleDownload}
                        >
                            <span className="action-icon" style={{ fontSize: '1.4rem', filter: 'none' }}>💾</span>
                            <span className="action-label" style={{ color: '#fff', fontSize: '0.9rem', fontWeight: 'bold' }}>{t('camera.save')}</span>
                        </button>

                        {/* Copy Link Button */}
                        <button
                            className="action-btn"
                            disabled={isLoading || !imageDataUrl}
                            style={{
                                flex: 1,
                                height: '60px',
                                flexDirection: 'row',
                                gap: '8px',
                                background: copyFeedback ? '#e8f5e9' : 'linear-gradient(180deg, #2196F3 0%, #1976D2 100%)',
                                borderColor: '#0D47A1',
                                border: '3px solid #0d47a1',
                                borderRadius: '12px',
                                boxShadow: '0 4px 0 #0d47a1, 0 6px 10px rgba(0, 0, 0, 0.2)',
                                opacity: isLoading ? 0.6 : 1,
                                cursor: isLoading ? 'not-allowed' : 'pointer',
                                filter: isLoading ? 'grayscale(0.5)' : 'none'
                            }}
                            onClick={handleCopyLink}
                        >
                            <span className="action-icon" style={{ fontSize: '1.4rem', filter: 'none' }}>🔗</span>
                            <span className="action-label" style={{ color: copyFeedback ? '#333' : '#fff', fontSize: '0.9rem', fontWeight: 'bold' }}>
                                {copyFeedback || t('camera.copyLink')}
                            </span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
