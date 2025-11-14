import React from 'react';
import type { CharacterMood, CharacterAction } from '../../../../../types/character';
import './OrangeTailJello.css';

interface OrangeTailJelloProps {
  size?: 'small' | 'medium' | 'large';
  mood?: CharacterMood;
  action?: CharacterAction;
  onClick?: () => void;
}

export const OrangeTailJello: React.FC<OrangeTailJelloProps> = ({
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
    return 'https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEi2MzUtZQes6HJdIo2Br9xAHxzSusknmuGaSPjjMVgwjtE_HM2UMm5_AaDijgC90TsHM1VDBe0V4dD-6vtmN9065aSUZckSq6dvpEiAkMl0myM9BmGk_uB0MLzjDh_oGnKzWSNZSRWBzeHTOniaqCcLYasdzNYgnCuTiXuiN3j-qFYjeoNdFKybUhqvHPM/s185/slime2-10.png';
  };

  const sizeInPixels = getSizeInPixels();

  return (
    <div
      className={`orange-tail-jello orange-tail-jello--${action}`}
      onClick={onClick}
      style={{
        width: sizeInPixels,
        height: sizeInPixels,
      }}
    >
      <img
        src={getImageUrl()}
        alt="Orange Tail Jello"
        className="orange-tail-jello__image"
        style={{
          width: '100%',
          height: '100%',
          imageRendering: 'pixelated',
        }}
      />
    </div>
  );
};

export default OrangeTailJello;
