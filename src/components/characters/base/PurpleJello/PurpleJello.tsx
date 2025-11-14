import React from 'react';
import type { Character, CharacterMood, CharacterAction } from '../../../../types/character';
import './PurpleJello.css';

interface PurpleJelloProps {
  character: Character;
  size?: 'small' | 'medium' | 'large';
  mood?: CharacterMood;
  action?: CharacterAction;
  onClick?: () => void;
}

export const PurpleJello: React.FC<PurpleJelloProps> = ({
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
    return 'https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEjItO-N-JseI-Wgy8_2rcjrqFLMTKzXZfy6QA-aFybdohVYcQ9ZJ_PiK957_y_yePXr6lHEsDuMaxrSpDFTO_8cbqvQ7yGoq6Rg_lxGPPZmGzQuJa-8LZJOcwzTWt8nWcWYZIoFOfj5H1E7tkVRylBf0vRRl78isbHjb2Zx39twSm9rSEHhA_cYry0WbB8/s185/slime1-7.png';
  };

  const sizeInPixels = getSizeInPixels();

  return (
    <div
      className={`purple-jello purple-jello--${action}`}
      onClick={onClick}
      style={{
        width: sizeInPixels,
        height: sizeInPixels,
      }}
    >
      <img
        src={getImageUrl()}
        alt="Purple Jello"
        className="purple-jello__image"
        style={{
          width: '100%',
          height: '100%',
          imageRendering: 'pixelated',
        }}
      />
    </div>
  );
};

export default PurpleJello;
