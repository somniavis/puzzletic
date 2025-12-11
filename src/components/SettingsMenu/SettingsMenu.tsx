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
  const [isSaving, setIsSaving] = useState(false);

  if (!isOpen) return null;

  const handleClose = () => {
    playButtonSound();
    setCurrentView('main');
    setIsSaving(false); // Reset state
    onClose();
  };

  const handleSaveClick = async () => {
    playButtonSound();
    if (isSaving) return;

    setIsSaving(true);
    const success = await saveToCloud();

    // Show visual feedback (e.g. keep "Saving..." for a moment or show "Saved!")
    // For now, we simulate a small delay if quick, or just reset.
    // Ideally we would change text to "Saved!" then revert.

    setTimeout(() => {
      setIsSaving(false);
      if (success) alert("Saved to Cloud! ☁️");
      else alert("Save failed. Please try again.");
    }, 500);
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
            <button className="food-item" onClick={handleSaveClick} disabled={isSaving}>
              <span className="food-item-icon">☁️</span>
              <span className="food-item-name">{isSaving ? 'Saving...' : 'Cloud Save'}</span>
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
