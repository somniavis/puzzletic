import React from 'react';
import type { Character, CharacterMood, CharacterAction } from '../../../../types/character';
import './MintJello.css';

interface MintJelloProps {
  character: Character;
  size?: 'small' | 'medium' | 'large';
  mood?: CharacterMood;
  action?: CharacterAction;
  onClick?: () => void;
}

export const MintJello: React.FC<MintJelloProps> = ({
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
    return 'https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEg14xQR92IIXYOmxM0ykDxQT0FOB0qS51P3U_zme8m7x-YItAVFHslH8ELNnoaeu1_HnifLRXYoKJBBJTgMWWqM3nyEiZhBI4BNCOMqINk4ZGuzJWfiJN9CuYDjlRDRQLtZL5V1Uu4VCwEq9yKe4EtF-YMd9XI6-DylHuEp9ztIRyf9ylsb49qSCmsqNJQ/s185/slime1-4.png';
  };

  const sizeInPixels = getSizeInPixels();

  return (
    <div
      className={`mint-jello mint-jello--${action}`}
      onClick={onClick}
      style={{
        width: sizeInPixels,
        height: sizeInPixels,
      }}
    >
      <img
        src={getImageUrl()}
        alt="Mint Jello"
        className="mint-jello__image"
        style={{
          width: '100%',
          height: '100%',
          imageRendering: 'pixelated',
        }}
      />
    </div>
  );
};

export default MintJello;
