import React from 'react';
import { playButtonSound } from '../../utils/sound';
import './PetRoom.css'; // Reusing existing styles

interface MenuModalProps {
    title: string;
    onClose: () => void;
    children: React.ReactNode;
    headerContent?: React.ReactNode; // For category tabs in Shop
    variant?: 'grid' | 'custom';
}

export const MenuModal: React.FC<MenuModalProps> = ({ title, onClose, children, headerContent, variant = 'grid' }) => {
    return (
        <div className="food-menu-overlay" onClick={() => { playButtonSound(); onClose(); }}>
            <div className="food-menu" onClick={(e) => e.stopPropagation()}>
                <div className="food-menu-header">
                    <h3>{title}</h3>
                    <button className="close-btn" onClick={() => { playButtonSound(); onClose(); }}>✕</button>
                </div>

                {headerContent}

                <div className={variant === 'grid' ? "food-items-grid" : "menu-modal-content"}>
                    {children}
                </div>
            </div>
        </div>
    );
};
