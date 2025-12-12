import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { playButtonSound } from '../../utils/sound';
import { useSound } from '../../contexts/SoundContext';
import { useAuth } from '../../contexts/AuthContext';
import { useNurturing } from '../../contexts/NurturingContext';
import './SettingsMenu.css';

import { useNavigate } from 'react-router-dom';

interface SettingsMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

type MenuView = 'main' | 'sound' | 'language' | 'admin';

export const SettingsMenu: React.FC<SettingsMenuProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const { settings, toggleBgm, toggleSfx } = useSound();
  const { logout } = useAuth();
  const { saveToCloud } = useNurturing();
  const [currentView, setCurrentView] = useState<MenuView>('main');
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'success' | 'error' | 'cooldown'>('idle');
  const [cooldownTime, setCooldownTime] = useState(0);

  if (!isOpen) return null;

  const handleClose = () => {
    playButtonSound();
    setCurrentView('main');
    // Don't reset if in cooldown to persist protection while menu is closed? 
    // Actually simplicity: reset valid status, keep cooldown if feasible. 
    // For now, let's reset status to idle but if we want strictly block, we'd need global state or context.
    // Given the request is "abnormally pressed", simple local state throttling is a good start.
    // If user closes and reopens, they might bypass. 
    // Optimization: Move throttling to Context? 
    // User asked "Save Button". Let's throttle button.
    if (saveStatus !== 'cooldown') setSaveStatus('idle');
    onClose();
  };

  const handleSaveClick = async () => {
    playButtonSound();
    if (saveStatus === 'saving' || saveStatus === 'cooldown') return;

    // Double check timestamp throttling locally if needed, but state machine handles it.

    setSaveStatus('saving');
    const success = await saveToCloud();

    if (success) {
      setSaveStatus('success');
      // Start Cooldown (e.g. 1 minute)
      setTimeout(() => {
        setSaveStatus('cooldown');
        setCooldownTime(60);

        // Count down
        const timer = setInterval(() => {
          setCooldownTime(prev => {
            if (prev <= 1) {
              clearInterval(timer);
              setSaveStatus('idle');
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      }, 2000); // 2s show "Saved!"
    } else {
      setSaveStatus('error');
      setTimeout(() => {
        setSaveStatus('idle');
      }, 2000);
    }
  };


  const handleBack = () => {
    playButtonSound();
    setCurrentView('main');
  };

  const handleSoundClick = () => {
    playButtonSound();
    setCurrentView('sound');
  };

  const handleLanguageClick = () => {
    playButtonSound();
    setCurrentView('language');
  };

  const handleBgmToggle = () => {
    playButtonSound();
    toggleBgm();
    console.log('BGM:', !settings.bgmEnabled ? 'ON' : 'OFF');
  };

  const handleSfxToggle = () => {
    playButtonSound();
    toggleSfx();
    console.log('SFX:', !settings.sfxEnabled ? 'ON' : 'OFF');
  };

  const handleLanguageSelect = (language: string) => {
    playButtonSound();
    i18n.changeLanguage(language);
    console.log('Language changed to:', language);
  };

  const handleAdminClick = () => {
    playButtonSound();
    setCurrentView('admin');
  };

  const handleNavigateToGallery = () => {
    playButtonSound();
    navigate('/gallery');
    onClose();
  };

  const handleNavigateToStats = () => {
    playButtonSound();
    navigate('/stats');
    onClose();
  };

  const handleLogout = async () => {
    playButtonSound();
    try {
      // "Safe Save": Sync before logging out
      await saveToCloud();

      await logout();
      onClose();
      // Navigation to login is handled by ProtectedRoute in App.tsx
    } catch (error) {
      console.error('Failed to logout:', error);
    }
  };

  return (
    <div className="food-menu-overlay" onClick={handleClose}>
      <div className="food-menu" onClick={(e) => e.stopPropagation()}>
        <div className="food-menu-header">
          <div className="header-left">
            {currentView !== 'main' && (
              <button className="back-btn" onClick={handleBack}>
                ←
              </button>
            )}
            <h3>
              {currentView === 'main' && t('settings.title')}
              {currentView === 'sound' && t('settings.sound.title')}
              {currentView === 'language' && t('settings.language.title')}
              {currentView === 'admin' && t('settings.admin.title')}
            </h3>
          </div>
          <button className="close-btn" onClick={handleClose}>✕</button>
        </div>

        {/* Main Menu */}
        {currentView === 'main' && (
          <div className="food-items-grid">
            <button className={`food-item ${saveStatus === 'success' ? 'save-success' : ''}`} onClick={handleSaveClick} disabled={saveStatus === 'saving' || saveStatus === 'cooldown'}>
              <span className="food-item-icon">
                {saveStatus === 'saving' && '⏳'}
                {saveStatus === 'success' && '✅'}
                {saveStatus === 'error' && '❌'}
                {saveStatus === 'cooldown' && '🛑'}
                {saveStatus === 'idle' && '☁️'}
              </span>
              <span className="food-item-name">
                {saveStatus === 'saving' && 'Saving...'}
                {saveStatus === 'success' && 'Saved!'}
                {saveStatus === 'error' && 'Failed'}
                {saveStatus === 'cooldown' && `Wait ${cooldownTime}s`}
                {saveStatus === 'idle' && 'Cloud Save'}
              </span>
            </button>

            <button className="food-item" onClick={handleSoundClick}>
              <span className="food-item-icon">🔊</span>
              <span className="food-item-name">{t('settings.sound.title')}</span>
            </button>

            <button className="food-item" onClick={handleLanguageClick}>
              <span className="food-item-icon">🌐</span>
              <span className="food-item-name">{t('settings.language.title')}</span>
            </button>

            <button className="food-item" onClick={handleAdminClick}>
              <span className="food-item-icon">🔧</span>
              <span className="food-item-name">{t('settings.admin.title')}</span>
            </button>

            <button className="food-item" onClick={handleLogout}>
              <span className="food-item-icon">🚪</span>
              <span className="food-item-name">Logout</span>
            </button>
          </div>
        )}

        {/* Sound Submenu */}
        {currentView === 'sound' && (
          <div className="food-items-grid">
            <button className="food-item" onClick={handleBgmToggle}>
              <span className="food-item-icon">🎵</span>
              <span className="food-item-name">{t('settings.sound.bgm')}</span>
              <div className="food-item-effects">
                <span className={`effect ${settings.bgmEnabled ? 'effect--on' : 'effect--off'}`}>
                  {settings.bgmEnabled ? t('settings.sound.on') : t('settings.sound.off')}
                </span>
              </div>
            </button>

            <button className="food-item" onClick={handleSfxToggle}>
              <span className="food-item-icon">🔔</span>
              <span className="food-item-name">{t('settings.sound.sfx')}</span>
              <div className="food-item-effects">
                <span className={`effect ${settings.sfxEnabled ? 'effect--on' : 'effect--off'}`}>
                  {settings.sfxEnabled ? t('settings.sound.on') : t('settings.sound.off')}
                </span>
              </div>
            </button>
          </div>
        )}

        {/* Language Submenu */}
        {currentView === 'language' && (
          <div className="food-items-grid">
            <button
              className={`food-item food-item--selected`}
              onClick={() => handleLanguageSelect('en-US')}
            >
              <span className="food-item-icon language-flag">🇺🇸</span>
              <div className="language-info">
                <span className="food-item-name">English</span>
              </div>
              <div className="food-item-effects">
                <span className="effect effect--selected">✓ {t('settings.language.selected')}</span>
              </div>
            </button>
          </div>
        )}

        {/* Admin Submenu */}
        {currentView === 'admin' && (
          <div className="food-items-grid">
            <button className="food-item" onClick={handleNavigateToGallery}>
              <span className="food-item-icon">🖼️</span>
              <span className="food-item-name">{t('settings.admin.gallery')}</span>
            </button>

            <button className="food-item" onClick={handleNavigateToStats}>
              <span className="food-item-icon">📊</span>
              <span className="food-item-name">{t('settings.admin.stats')}</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default SettingsMenu;
