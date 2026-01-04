import React from 'react';
import { playButtonSound } from '../../../../utils/sound';

interface HeaderProps {
    title: string;
    bgmEnabled: boolean;
    onExit: () => void;
    onToggleBgm: () => void;
    className?: string; // Allow custom styling extensions if needed
}

export const GameLayoutHeader: React.FC<HeaderProps> = ({
    title,
    bgmEnabled,
    onExit,
    onToggleBgm,
    className
}) => {
    return (
        <header className={`layout1-header ${className || ''}`}>
            {/* Note: We reuse 'layout1-header' class for compatibility or we can rename to general 'game-header' in CSS */}
            <button className="icon-btn" onClick={() => { playButtonSound(); onExit(); }} style={{ fontSize: '1.5rem' }}>🔙</button>
            <div className="header-title">{title}</div>
            <button className="icon-btn" onClick={() => { playButtonSound(); onToggleBgm(); }} style={{ fontSize: '1.5rem' }}>
                {bgmEnabled ? '🎵' : '🔇'}
            </button>
        </header>
    );
};
