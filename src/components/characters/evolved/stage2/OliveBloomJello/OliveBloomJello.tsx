import React from 'react';
import type { CharacterMood, CharacterAction } from '../../../../../types/character';
import './OliveBloomJello.css';

interface OliveBloomJelloProps {
  size?: 'small' | 'medium' | 'large';
  mood?: CharacterMood;
  action?: CharacterAction;
  onClick?: () => void;
}

export const OliveBloomJello: React.FC<OliveBloomJelloProps> = ({
  size = 'medium',
  action = 'idle',
  onClick,
}) => {
  const getSizeInPixels = () => {
    switch (size) {
      case 'small': return 96;
      case 'large': return 288;
      default: return 192;
    }
  };

  // Base image URL (stage 2)
  const getImageUrl = () => {
    return 'https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEgfyE-JKM4RHCQu2kC9Q62silTEfqFndoEbFzjJH_z-c6tHfVgt8blUxHJe_1mNh-jf5DqOyM7VxIYc1kCjKYLdirJ0o7E0ilYrcUHJq1JR5Uk9hqTmeDkgowW4KTQiArA0Pm2NRBQMLYVGDowT2qTAcIAgSwLxOAI0-xKJHA6czO6lLcwOO_BDixoHbGc/s185/slime2-11.png';
  };

  const sizeInPixels = getSizeInPixels();

  return (
    <div
      className={`olive-bloom-jello olive-bloom-jello--${action}`}
      onClick={onClick}
      style={{
        width: sizeInPixels,
        height: sizeInPixels,
      }}
    >
      <img
        src={getImageUrl()}
        alt="Olive Bloom Jello"
        className="olive-bloom-jello__image"
        style={{
          width: '100%',
          height: '100%',
          imageRendering: 'pixelated',
        }}
      />
    </div>
  );
};

export default OliveBloomJello;
