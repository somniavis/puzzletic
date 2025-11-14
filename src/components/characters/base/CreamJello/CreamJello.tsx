import React from 'react';
import type { Character, CharacterMood, CharacterAction } from '../../../../types/character';
import './CreamJello.css';

interface CreamJelloProps {
  character: Character;
  size?: 'small' | 'medium' | 'large';
  mood?: CharacterMood;
  action?: CharacterAction;
  onClick?: () => void;
}

export const CreamJello: React.FC<CreamJelloProps> = ({
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

  // Base image URL (stage 1)
  const getImageUrl = () => {
    // You can add different images for different moods/actions if needed
    return 'https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEh4aUYzuEalEiBRhGQIdLhwmDS5C-LYRRY5e9lIqrsabn2DWJZpjp8OAxNC1iXhODd8AUcLLHZFRrsZm45hX00S-5xLENf8ZaDDmNK_EZFtkSpdb_UmGly9RHSn-qODdi8Y9pnBSVa5OX8KyKKFv_XHqBdCQI9UZoveyc6i46wRYNNg_iEev-7_OohOJzM/s185/slime1-6.png';
  };

  const sizeInPixels = getSizeInPixels();

  return (
    <div
      className={`cream-jello cream-jello--${action}`}
      onClick={onClick}
      style={{
        width: sizeInPixels,
        height: sizeInPixels,
      }}
    >
      <img
        src={getImageUrl()}
        alt="Cream Jello"
        className="cream-jello__image"
        style={{
          width: '100%',
          height: '100%',
          imageRendering: 'pixelated',
        }}
      />
    </div>
  );
};

export default CreamJello;
