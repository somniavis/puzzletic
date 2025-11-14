import React from 'react';
import type { CharacterMood, CharacterAction } from '../../../../../types/character';
import './LimeLeafJello.css';

interface LimeLeafJelloProps {
  size?: 'small' | 'medium' | 'large';
  mood?: CharacterMood;
  action?: CharacterAction;
  onClick?: () => void;
}

export const LimeLeafJello: React.FC<LimeLeafJelloProps> = ({
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
    return 'https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEhj6PDZAYEH09Nj20JvPK9ryFUJVUe91H_Us6DXjLvMKTtHbktwmg9Kzv6KNzuWrxNffuQqcDID2tzPxmsQ78zQHAu82R_phzxDDSbmHv8E_DdoqbBZ5HUlPjzXPWZVgHiollFLGO16Dz_rP2Wymlj1s0TjXHLMZPJYXkR1uA-1n4bXcQ9ALDCJJYw8UiY/s185/slime2-3.png';
  };

  const sizeInPixels = getSizeInPixels();

  return (
    <div
      className={`lime-leaf-jello lime-leaf-jello--${action}`}
      onClick={onClick}
      style={{
        width: sizeInPixels,
        height: sizeInPixels,
      }}
    >
      <img
        src={getImageUrl()}
        alt="Lime Leaf Jello"
        className="lime-leaf-jello__image"
        style={{
          width: '100%',
          height: '100%',
          imageRendering: 'pixelated',
        }}
      />
    </div>
  );
};

export default LimeLeafJello;
