import React, { createContext, useContext, useState, useEffect } from 'react';

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
      bgmEnabled: true,
      sfxEnabled: true,
    };
  });

  // Save to localStorage whenever settings change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  }, [settings]);

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
