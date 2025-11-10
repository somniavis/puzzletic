import React from 'react';
import type { Character, CharacterMood, CharacterAction } from '../../../types/character';
import { PixelRenderer } from '../../PixelArt/PixelRenderer';
import {
  greenSlimeIdle,
  greenSlimeHappy,
  greenSlimeSleeping
} from './GreenSlimePixelData';
import './GreenSlime.css';

interface GreenSlimeProps {
  character: Character;
  size?: 'small' | 'medium' | 'large';
  mood?: CharacterMood;
  action?: CharacterAction;
  onClick?: () => void;
}

export const GreenSlime: React.FC<GreenSlimeProps> = ({
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
    if (mood === 'happy' || mood === 'excited') return greenSlimeHappy;

    // Sleeping mood - closed eyes
    if (mood === 'sleeping') return greenSlimeSleeping;

    // Default: neutral, idle, sad
    return greenSlimeIdle;
  };

  return (
    <div className={`green-slime green-slime--${action}`} onClick={onClick}>
      <PixelRenderer
        pixels={getPixelData()}
        pixelSize={getPixelSize()}
      />
    </div>
  );
};

export default GreenSlime;
