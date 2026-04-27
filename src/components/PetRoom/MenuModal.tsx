import React from 'react';
import { playButtonSound } from '../../utils/sound';
import { PixelModalShell } from '../common/PixelModalShell';
import './PetRoom.css'; // Reusing existing styles

interface MenuModalProps {
    title: string;
    onClose: () => void;
    children: React.ReactNode;
    headerContent?: React.ReactNode; // For category tabs in Shop
    variant?: 'grid' | 'custom';
    className?: string;
    contentOverlay?: React.ReactNode;
}

export const MenuModal: React.FC<MenuModalProps> = ({
    title,
    onClose,
    children,
    headerContent,
    variant = 'grid',
    className = '',
    contentOverlay,
}) => {
    return (
        <PixelModalShell
            title={title}
            onClose={() => { playButtonSound(); onClose(); }}
            className={className}
        >
            {headerContent}

            {variant === 'grid' ? (
                <div className="menu-modal-grid-shell">
                    <div className="food-items-grid">
                        {children}
                    </div>
                    {contentOverlay}
                </div>
            ) : (
                <div className="menu-modal-content">
                    {children}
                </div>
            )}
        </PixelModalShell>
    );
};
