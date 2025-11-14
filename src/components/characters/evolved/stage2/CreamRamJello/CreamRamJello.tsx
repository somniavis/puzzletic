import React from 'react';
import type { CharacterMood, CharacterAction } from '../../../../../types/character';
import './CreamRamJello.css';

interface CreamRamJelloProps {
  size?: 'small' | 'medium' | 'large';
  mood?: CharacterMood;
  action?: CharacterAction;
  onClick?: () => void;
}

export const CreamRamJello: React.FC<CreamRamJelloProps> = ({
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
    return 'https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEigmCpQRvEKBaOpqF_3MOvmPO9lFbVjjdZACeMWmuJDj4Lg8asAo_zIISalNjI1-ZazzK9QIUbKZitBa5-D-yn-5jXBMOqNie4A8cCixKH6kyyDk8gOhkPPdHl_3y9S_TkeABJmAQE69lNeNoW0NbJi0i0SE0mS5Nj5paGf1caIpzO1XSR0T29svcDtSEg/s185/slime2-6.png';
  };

  const sizeInPixels = getSizeInPixels();

  return (
    <div
      className={`cream-ram-jello cream-ram-jello--${action}`}
      onClick={onClick}
      style={{
        width: sizeInPixels,
        height: sizeInPixels,
      }}
    >
      <img
        src={getImageUrl()}
        alt="Cream Ram Jello"
        className="cream-ram-jello__image"
        style={{
          width: '100%',
          height: '100%',
          imageRendering: 'pixelated',
        }}
      />
    </div>
  );
};

export default CreamRamJello;
