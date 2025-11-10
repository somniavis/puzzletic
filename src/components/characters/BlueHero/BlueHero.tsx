import React from 'react';
import type { Character, CharacterMood, CharacterAction } from '../../../types/character';
import { PixelRenderer } from '../../PixelArt/PixelRenderer';
import { blueHeroIdle, blueHeroHappy, blueHeroSleeping } from './BlueHeroPixelData';
import './BlueHero.css';

interface BlueHeroProps {
  character: Character;
  size?: 'small' | 'medium' | 'large';
  mood?: CharacterMood;
  action?: CharacterAction;
  onClick?: () => void;
}

export const BlueHero: React.FC<BlueHeroProps> = ({
  size = 'medium',
  mood = 'neutral',
  action = 'idle',
  onClick,
}) => {
  const getPixelSize = () => {
    switch (size) {
      case 'small': return 4;
      case 'large': return 12;
      default: return 8;
    }
  };

  const getPixelData = () => {
    // Happy moods: happy, excited
    if (mood === 'happy' || mood === 'excited') return blueHeroHappy;

    // Sleeping mood
    if (mood === 'sleeping') return blueHeroSleeping;

    // Sad mood - use idle for now (can create sad sprite later)
    if (mood === 'sad') return blueHeroIdle;

    // Default: neutral, idle
    return blueHeroIdle;
  };

  return (
    <div className={`blue-hero blue-hero--${action}`} onClick={onClick}>
      <PixelRenderer
        pixels={getPixelData()}
        pixelSize={getPixelSize()}
      />
    </div>
  );
};

export default BlueHero;
