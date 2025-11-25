import React, { createContext, useContext, useState, useEffect } from 'react';
import { startBackgroundMusic, stopBackgroundMusic } from '../utils/sound';

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

  // BGM 설정이 변경될 때 배경음 제어
  useEffect(() => {
    // 타이머를 사용하여 프리로드가 완료될 시간을 확보
    const timer = setTimeout(() => {
      if (settings.bgmEnabled) {
        startBackgroundMusic();
      } else {
        stopBackgroundMusic();
      }
    }, 500); // 500ms 후 재생 시도

    // cleanup
    return () => {
      clearTimeout(timer);
      stopBackgroundMusic();
    };
  }, [settings.bgmEnabled]);

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
