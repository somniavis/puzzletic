import React from 'react';
import type { CharacterMood, CharacterAction } from '../../../../../types/character';
import './BrownWillowJello.css';

interface BrownWillowJelloProps {
  size?: 'small' | 'medium' | 'large';
  mood?: CharacterMood;
  action?: CharacterAction;
  onClick?: () => void;
}

export const BrownWillowJello: React.FC<BrownWillowJelloProps> = ({
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
    return 'https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEgDpr48AJ1Ft8L5w5oH6NpGQbC5ZlADb2QQHdx3alY2F0Cf6O3vMge-3NhSWBI0JHWp_uC9YXNJvmlPdfalNQpDwFZMNpvf93ine4AmbolNmxo9Y8cJW7zhMz3-t4FIViqopDQk79yMDdBjVkCZ5lN8hOGlZVJNDAJR2iLXBhYegq_wJginOybPOHwub5M/s185/slime2-9.png';
  };

  const sizeInPixels = getSizeInPixels();

  return (
    <div
      className={`brown-willow-jello brown-willow-jello--${action}`}
      onClick={onClick}
      style={{
        width: sizeInPixels,
        height: sizeInPixels,
      }}
    >
      <img
        src={getImageUrl()}
        alt="Brown Willow Jello"
        className="brown-willow-jello__image"
        style={{
          width: '100%',
          height: '100%',
          imageRendering: 'pixelated',
        }}
      />
    </div>
  );
};

export default BrownWillowJello;
