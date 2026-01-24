import React from 'react';
import { playButtonSound } from '../../utils/sound';

interface WallButtonProps {
    label: string;
    icon: string;
    onClick: () => void;
    type?: 'normal' | 'legendary';
    style?: React.CSSProperties;
}

export const WallButton: React.FC<WallButtonProps> = ({
    label,
    icon,
    onClick,
    type = 'normal',
    style
}) => {
    const defaultStyle: React.CSSProperties = {
        // position: 'absolute', // Let parent decide
        zIndex: 20,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '8px',
        cursor: 'pointer',
        transform: 'scale(0.9)',
        transition: 'transform 0.2s',
        pointerEvents: 'auto', // Important for Overlay usage
    };

    return (
        <div
            className={`wall-trigger-btn ${type === 'legendary' ? 'legendary' : ''}`}
            onClick={(e) => { e.stopPropagation(); playButtonSound(); onClick(); }}
            style={{ ...defaultStyle, ...style }}
        >
            <div className="frame-icon" style={{
                width: '60px',
                height: '70px',
                background: type === 'legendary'
                    ? 'linear-gradient(135deg, #FFD700, #FFA500)'
                    : 'rgba(255, 255, 255, 0.9)',
                border: '4px solid #8B4513',
                borderRadius: '8px',
                boxShadow: '0 4px 8px rgba(0,0,0,0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '32px'
            }}>
                {icon}
            </div>
            <span style={{
                background: 'rgba(0,0,0,0.7)',
                color: 'white',
                padding: '4px 8px',
                borderRadius: '12px',
                fontSize: '12px',
                fontWeight: 'bold',
                whiteSpace: 'nowrap'
            }}>
                {label}
            </span>
        </div>
    );
};
