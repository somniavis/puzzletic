import React from 'react';
import type { Character, CharacterMood, CharacterAction } from '../../../../types/character';
import './YellowJello.css';

interface YellowJelloProps {
  character: Character;
  size?: 'small' | 'medium' | 'large';
  mood?: CharacterMood;
  action?: CharacterAction;
  onClick?: () => void;
}

export const YellowJello: React.FC<YellowJelloProps> = ({
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
    return 'https://pub-1411335941ed4406b5f667f40e04a814.r2.dev/jello_img/jello-yello-tmp3.png';
  };

  const sizeInPixels = getSizeInPixels();

  return (
    <div
      className={`yellow-jello yellow-jello--${action}`}
      onClick={onClick}
      style={{
        width: sizeInPixels,
        height: sizeInPixels,
      }}
    >
      <img
        src={getImageUrl()}
        alt="Yellow Jello"
        className="yellow-jello__image"
        style={{
          width: '100%',
          height: '100%',
          imageRendering: 'pixelated',
        }}
      />
    </div>
  );
};

export default YellowJello;
