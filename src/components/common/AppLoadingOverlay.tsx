import React from 'react';
import { useTranslation } from 'react-i18next';

export const AppLoadingOverlay: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 200,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        background: 'linear-gradient(135deg, #FFF9E6 0%, #FFE4B5 100%)',
      }}
    >
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '1rem',
        }}
      >
        <div
          style={{
            fontSize: '4rem',
            animation: 'app-loading-bounce-spin 1.2s infinite ease-in-out',
          }}
        >
          🐾
        </div>
        <div
          style={{
            fontSize: '1.2rem',
            fontWeight: 800,
            color: '#8B4513',
            textTransform: 'uppercase',
            letterSpacing: '2px',
            animation: 'app-loading-pulse 1.5s infinite ease-in-out',
          }}
        >
          {t('common.loading')}
        </div>
      </div>
      <style>{`
        @keyframes app-loading-bounce-spin {
          0% { transform: translateY(0) rotate(0deg) scale(1); }
          50% { transform: translateY(-20px) rotate(180deg) scale(1.1); }
          100% { transform: translateY(0) rotate(360deg) scale(1); }
        }
        @keyframes app-loading-pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.6; }
        }
      `}</style>
    </div>
  );
};

