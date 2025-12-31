import React from 'react';

export interface PowerUpBtnProps {
    count: number;
    color: 'blue' | 'red' | 'yellow';
    icon: string;
    title: string;
    onClick: () => void;
    disabledConfig: boolean;
    status: 'active' | 'maxed' | 'normal';
}

export const PowerUpBtn: React.FC<PowerUpBtnProps> = ({ count, color, icon, title, onClick, disabledConfig, status }) => {
    // Explicit colors to guarantee correct rendering and avoid global CSS overrides
    const colors = {
        blue: { normal: '#3b82f6', maxed: '#93c5fd' }, // blue-500, blue-300
        red: { normal: '#ef4444', maxed: '#fca5a5' }, // red-500, red-300
        yellow: { normal: '#eab308', maxed: '#fde047' } // yellow-500, yellow-300
    };

    const isHereActive = status === 'active';
    const isActuallyDisabled = count === 0 && !isHereActive;

    const getButtonStyle = (): React.CSSProperties => {
        if (isHereActive) {
            // Active: Bright Yellow background, Black text
            return {
                width: '3.5rem', height: '2rem', // Fixed size
                display: 'flex', justifyContent: 'center', alignItems: 'center', padding: 0, // Force Center
                backgroundColor: '#facc15', // yellow-400
                color: '#000000',
                transform: 'scale(1.1)',
                zIndex: 10,
                border: '1px solid #eab308', // Darker yellow border
                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' // Floating shadow
            };
        }
        if (isActuallyDisabled) {
            // Disabled (0 count): White Card style (Empty Slot look)
            return {
                width: '3.5rem', height: '2rem', // Fixed size
                display: 'flex', justifyContent: 'center', alignItems: 'center', padding: 0, // Force Center
                backgroundColor: '#ffffff', // White background
                color: '#e5e7eb', // Gray-200 for placeholder icon (faint)
                cursor: 'not-allowed',
                border: '1px solid #e5e7eb', // Faint border
                boxShadow: '0 2px 4px rgba(0,0,0,0.05)' // Subtle shadow for empty state
            };
        }
        // Normal/Maxed state
        return {
            width: '3.5rem', height: '2rem', // Fixed size
            display: 'flex', justifyContent: 'center', alignItems: 'center', padding: 0, // Force Center
            backgroundColor: colors[color][status === 'maxed' ? 'maxed' : 'normal'],
            color: '#ffffff',
            cursor: status === 'maxed' ? 'not-allowed' : 'pointer',
            border: '1px solid rgba(0,0,0,0.1)', // Border for definition
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)' // Standard shadow
        };
    };

    const handleClick = () => {
        if (disabledConfig || count === 0) return;
        onClick();
    };

    // Base layout classes: Fixed width/height
    const baseClasses = "relative w-14 h-8 rounded-xl transition-all shadow-md flex items-center justify-center flex-shrink-0 powerup-btn";
    // Add ring for active state
    const activeClasses = isHereActive ? "ring-4 ring-yellow-200" : "";

    return (
        <button
            onClick={handleClick}
            disabled={isActuallyDisabled}
            style={{
                ...getButtonStyle(),
                // Style prop overrides are handled in getButtonStyle now for clarity, but backgroundColor here acts as fallback?
                // Actually getButtonStyle provides everything.
            }}
            className={`${baseClasses} ${activeClasses}`}
            title={title}
        >
            {icon}
            <span
                className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center leading-none shadow-sm"
                style={{ zIndex: 20 }}
            >
                {count}
            </span>
        </button>
    );
};
