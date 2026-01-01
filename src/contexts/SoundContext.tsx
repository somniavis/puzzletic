import React, { createContext, useContext, useState, useEffect } from 'react';
import { startBackgroundMusic, stopBackgroundMusic } from '../utils/sound';
import { useAuth } from './AuthContext';

interface SoundSettings {
  bgmEnabled: boolean;
  sfxEnabled: boolean;
}

interface SoundContextType {
  settings: SoundSettings;
  toggleBgm: () => void;
  toggleSfx: () => void;
}

const SoundContext = createContext<SoundContextType | undefined>(undefined);

const STORAGE_KEY = 'puzzleletic_sound_settings';

export const SoundProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth(); // Access user state for BGM control

  const [settings, setSettings] = useState<SoundSettings>(() => {
    // Load from localStorage
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse sound settings:', e);
      }
    }
    // Default settings
    return {
      bgmEnabled: false,
      sfxEnabled: true,
    };
  });

  // Save to localStorage whenever settings change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  }, [settings]);

  // BGM control: depends on settings AND user login status
  useEffect(() => {
    const timer = setTimeout(() => {
      // Only play if enabled AND user is logged in
      if (settings.bgmEnabled && user) {
        startBackgroundMusic();
      } else {
        stopBackgroundMusic();
      }
    }, 500);

    return () => {
      clearTimeout(timer);
      stopBackgroundMusic(); // Cleanup on unmount or change
    };
  }, [settings.bgmEnabled, user]); // Re-run when user logs in/out

  const toggleBgm = () => {
    setSettings(prev => ({ ...prev, bgmEnabled: !prev.bgmEnabled }));
  };

  const toggleSfx = () => {
    setSettings(prev => ({ ...prev, sfxEnabled: !prev.sfxEnabled }));
  };

  return (
    <SoundContext.Provider value={{ settings, toggleBgm, toggleSfx }}>
      {children}
    </SoundContext.Provider>
  );
};

export const useSound = () => {
  const context = useContext(SoundContext);
  if (context === undefined) {
    throw new Error('useSound must be used within a SoundProvider');
  }
  return context;
};
