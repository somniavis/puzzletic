import React from 'react';
import './PixelModalShell.css';

interface PixelModalShellProps {
    title: React.ReactNode;
    onClose: () => void;
    children: React.ReactNode;
    className?: string;
    headerStart?: React.ReactNode;
}

export const PixelModalShell: React.FC<PixelModalShellProps> = ({
    title,
    onClose,
    children,
    className = '',
    headerStart,
}) => {
    const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    return (
        <div className="pr-modal-overlay" onClick={handleBackdropClick}>
            <div className={`pr-modal ${className}`.trim()} onClick={(e) => e.stopPropagation()}>
                <div className="pr-modal__header">
                    <div className="pr-modal__header-main">
                        {headerStart}
                        <h3 className="pr-modal__title">{title}</h3>
                    </div>
                    <button className="pr-modal__close" onClick={onClose}>✕</button>
                </div>
                {children}
            </div>
        </div>
    );
};

export default PixelModalShell;
