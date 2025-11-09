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
    if (mood === 'happy') return blueHeroHappy;
    if (mood === 'sleeping') return blueHeroSleeping;
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
