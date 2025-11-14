import React from 'react';
import type { CharacterMood, CharacterAction } from '../../../../../types/character';
import './BlueCatJello.css';

interface BlueCatJelloProps {
  size?: 'small' | 'medium' | 'large';
  mood?: CharacterMood;
  action?: CharacterAction;
  onClick?: () => void;
}

export const BlueCatJello: React.FC<BlueCatJelloProps> = ({
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
    return 'https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEhe6qH-LhW6p_KwMKSLg9r8bW_wVPFNfw8guWawO6JdgucI4ZwEFF_QbPJ1Rhc6TUDsVhE821v0iy7OhnB4SYSSNn-oaQPZkzrJlocIlfS0Am_xlHiHk_Y0QEjXutBh6Bfxl5_Jqqyto7IRPyNyMQvPm7yMo0nozCzTtRjoJlKogfGCm2MsGWdv5q1v2Ss/s185/slime2-5.png';
  };

  const sizeInPixels = getSizeInPixels();

  return (
    <div
      className={`blue-cat-jello blue-cat-jello--${action}`}
      onClick={onClick}
      style={{
        width: sizeInPixels,
        height: sizeInPixels,
      }}
    >
      <img
        src={getImageUrl()}
        alt="Blue Cat Jello"
        className="blue-cat-jello__image"
        style={{
          width: '100%',
          height: '100%',
          imageRendering: 'pixelated',
        }}
      />
    </div>
  );
};

export default BlueCatJello;
