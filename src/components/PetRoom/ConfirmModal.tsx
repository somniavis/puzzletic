import React from 'react';
import { playButtonSound } from '../../utils/sound';
import { PixelModalShell } from '../common/PixelModalShell';
import './PetRoom.css';

interface ConfirmModalProps {
    title: string;
    message: string;
    confirmLabel?: string;
    cancelLabel?: string;
    hideCancelButton?: boolean;
    showCloseButton?: boolean;
    onConfirm: () => void;
    onCancel: () => void;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
    title,
    message,
    confirmLabel = 'Yes',
    cancelLabel = 'No',
    hideCancelButton = false,
    showCloseButton = false,
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
        <PixelModalShell
            title={title}
            onClose={handleCancel}
            className={`pr-modal--confirm ${!showCloseButton ? 'pr-modal--confirm-hide-close' : ''}`.trim()}
        >
            <div className="confirm-modal__body">
                <p className="confirm-modal__message">{message}</p>
                <div className="confirm-modal__actions">
                    {!hideCancelButton && (
                        <button
                            type="button"
                            className="confirm-modal__button confirm-modal__button--secondary"
                            onClick={handleCancel}
                        >
                            <span className="action-label confirm-modal__button-label">{cancelLabel}</span>
                        </button>
                    )}
                    <button
                        type="button"
                        className="confirm-modal__button action-btn action-btn--main"
                        aria-label={confirmLabel}
                        onClick={handleConfirm}
                    >
                        <span className="confirm-modal__button-icon" aria-hidden="true">✓</span>
                    </button>
                </div>
            </div>
        </PixelModalShell>
    );
};
