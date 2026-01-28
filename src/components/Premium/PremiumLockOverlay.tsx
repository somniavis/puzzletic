import React from 'react';

export const PremiumLockOverlay: React.FC = () => {

    return (
        <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.65)',
            display: 'flex',
            flexDirection: 'row', // Horizontal layout
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px', // Add spacing between lock and badge
            borderRadius: '16px', // Matches card border radius
            zIndex: 10,
            backdropFilter: 'blur(2px)'
        }}>
            <div style={{
                fontSize: '1.5rem', // Slightly smaller for horizontal fit
                filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.5))',
                lineHeight: 1
            }}>
                🔒
            </div>
            <div style={{
                background: 'linear-gradient(135deg, #FFD700, #FFA500)',
                color: '#fff',
                padding: '4px 12px',
                borderRadius: '12px',
                fontSize: '0.8rem',
                fontWeight: 'bold',
                boxShadow: '0 2px 8px rgba(255, 215, 0, 0.4)',
                border: '1px solid rgba(255, 255, 255, 0.3)'
            }}>
                Premium
            </div>
        </div>
    );
};
