import React, { useState } from 'react';
import { playButtonSound } from '../../utils/sound';
import { useTranslation } from 'react-i18next';
import { PixelModalShell } from '../common/PixelModalShell';
import './PetRoom.css';

const LoadingSpinner = () => {
    const { t } = useTranslation();
    return (
        <div className="loading-spinner-container camera-modal__loading">
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
            const textArea = document.createElement('textarea');
            textArea.value = text;
            textArea.style.top = '0';
            textArea.style.left = '0';
            textArea.style.position = 'fixed';
            textArea.style.opacity = '0';

            document.body.appendChild(textArea);
            textArea.focus();
            textArea.select();

            try {
                const successful = document.execCommand('copy');
                setCopyFeedback(successful ? t('share.linkCopied') : t('share.copyFailed'));
            } catch (err) {
                console.error('Fallback: unable to copy', err);
                setCopyFeedback(t('share.copyFailed'));
            }

            document.body.removeChild(textArea);
            setTimeout(() => setCopyFeedback(null), 2000);
        };

        if (navigator.clipboard?.writeText) {
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
        <PixelModalShell
            title={t('camera.title')}
            onClose={handleClose}
            className="pr-modal--camera"
        >
            <div className="camera-modal">
                <div className="camera-modal__preview">
                    {isLoading || !imageDataUrl ? (
                        <LoadingSpinner />
                    ) : (
                        <img
                            src={imageDataUrl}
                            alt="Captured Pet Room"
                            className="camera-modal__image"
                        />
                    )}
                </div>

                <div className="camera-modal__actions">
                    <button
                        className="camera-modal__action camera-modal__action--download"
                        disabled={isLoading || !imageDataUrl}
                        onClick={handleDownload}
                    >
                        <span className="camera-modal__action-icon">💾</span>
                        <span className="camera-modal__action-label">{t('camera.save')}</span>
                    </button>

                    <button
                        className={`camera-modal__action camera-modal__action--copy ${copyFeedback ? 'is-success' : ''}`}
                        disabled={isLoading || !imageDataUrl}
                        onClick={handleCopyLink}
                    >
                        <span className="camera-modal__action-icon">🔗</span>
                        <span className="camera-modal__action-label">
                            {copyFeedback || t('camera.copyLink')}
                        </span>
                    </button>
                </div>
            </div>
        </PixelModalShell>
    );
};
