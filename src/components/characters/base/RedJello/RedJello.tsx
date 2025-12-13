import React from 'react';
import type { Character, CharacterMood, CharacterAction } from '../../../../types/character';
import './RedJello.css';

interface RedJelloProps {
  character: Character;
  size?: 'small' | 'medium' | 'large';
  mood?: CharacterMood;
  action?: CharacterAction;
  onClick?: () => void;
}

export const RedJello: React.FC<RedJelloProps> = ({
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

  const getImageUrl = () => {
    return 'https://pub-1411335941ed4406b5f667f40e04a814.r2.dev/jello_img/jello-red-1.png';
  };

  const sizeInPixels = getSizeInPixels();

  return (
    <div
      className={`red-jello red-jello--${action}`}
      onClick={onClick}
      style={{
        width: sizeInPixels,
        height: sizeInPixels,
      }}
    >
      <img
        src={getImageUrl()}
        alt="Red Jello"
        className="red-jello__image"
        style={{
          width: '100%',
          height: '100%',
          imageRendering: 'pixelated',
        }}
      />
    </div>
  );
};

export default RedJello;
