import React from 'react';
import { useTranslation } from 'react-i18next';

export const PremiumLockOverlay: React.FC = () => {
    const { t } = useTranslation();

    return (
        <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.65)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            borderRadius: '16px',
            zIndex: 10,
            backdropFilter: 'blur(2px)'
        }}>
            <div style={{
                fontSize: '1.55rem',
                filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.5))',
                lineHeight: 1
            }}>
                🔒
            </div>
            <div style={{
                background: 'linear-gradient(135deg, #8ff3dc, #31cdb4)',
                color: '#063b35',
                padding: '5px 13px',
                borderRadius: '999px',
                fontSize: '0.8rem',
                fontWeight: 900,
                lineHeight: 1,
                boxShadow: '0 2px 10px rgba(49, 205, 180, 0.38)',
                border: '1px solid rgba(255, 255, 255, 0.45)'
            }}>
                {t('profile.status.angelPass')}
            </div>
        </div>
    );
};
