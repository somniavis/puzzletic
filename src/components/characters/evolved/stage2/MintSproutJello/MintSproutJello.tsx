import React from 'react';
import type { CharacterMood, CharacterAction } from '../../../../../types/character';
import './MintSproutJello.css';

interface MintSproutJelloProps {
  size?: 'small' | 'medium' | 'large';
  mood?: CharacterMood;
  action?: CharacterAction;
  onClick?: () => void;
}

export const MintSproutJello: React.FC<MintSproutJelloProps> = ({
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
    return 'https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEi9-rg4HfHQPf6_wKf4TBUBgOPsuYIodqpZqYlo12ESDFwFqhH54Msn1S5LUI9716t7RdGaYtqnBOXnPV6spZppjWrX9ruII42Vy9DFvFmmM5UN4b1yfxAMM1Y_vGV57_500tM9b0_k3KnxTrxKcI8UU38lVn0VEWTlED6uAhflbKcegCp9cFg0u2wACiY/s185/slime2-4.png';
  };

  const sizeInPixels = getSizeInPixels();

  return (
    <div
      className={`mint-sprout-jello mint-sprout-jello--${action}`}
      onClick={onClick}
      style={{
        width: sizeInPixels,
        height: sizeInPixels,
      }}
    >
      <img
        src={getImageUrl()}
        alt="Mint Sprout Jello"
        className="mint-sprout-jello__image"
        style={{
          width: '100%',
          height: '100%',
          imageRendering: 'pixelated',
        }}
      />
    </div>
  );
};

export default MintSproutJello;
