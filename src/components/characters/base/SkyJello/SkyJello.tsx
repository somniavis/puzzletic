import React from 'react';
import type { Character, CharacterMood, CharacterAction } from '../../../../types/character';
import './SkyJello.css';

interface SkyJelloProps {
  character: Character;
  size?: 'small' | 'medium' | 'large';
  mood?: CharacterMood;
  action?: CharacterAction;
  onClick?: () => void;
}

export const SkyJello: React.FC<SkyJelloProps> = ({
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
    return 'https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEhXti4v3wpGoB_7e3moZaDMuLcAN5jIA9zMoC2z8-NZBrAaumNI9B2MXmYzk3caK2tevCNW93esU2c0PhWt3_1sE3Dt1uuS3fzFjxSalUc-sSA47oN7HYlC99t6bGYMrDJAuIqBMmPbdGetz9eE765BUxEKGu88xBXQ0oA_GchUZSehA_r2iNbvY_N5xOA/s185/slime1-8.png';
  };

  const sizeInPixels = getSizeInPixels();

  return (
    <div
      className={`sky-jello sky-jello--${action}`}
      onClick={onClick}
      style={{
        width: sizeInPixels,
        height: sizeInPixels,
      }}
    >
      <img
        src={getImageUrl()}
        alt="Sky Jello"
        className="sky-jello__image"
        style={{
          width: '100%',
          height: '100%',
          imageRendering: 'pixelated',
        }}
      />
    </div>
  );
};

export default SkyJello;
