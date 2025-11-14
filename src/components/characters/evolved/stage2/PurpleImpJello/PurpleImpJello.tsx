import React from 'react';
import type { CharacterMood, CharacterAction } from '../../../../../types/character';
import './PurpleImpJello.css';

interface PurpleImpJelloProps {
  size?: 'small' | 'medium' | 'large';
  mood?: CharacterMood;
  action?: CharacterAction;
  onClick?: () => void;
}

export const PurpleImpJello: React.FC<PurpleImpJelloProps> = ({
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
    return 'https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEjGejlMFcT2eN6pnXQoc4JnpRw4vdv1XZn0vt5bUIhFL0qil2Y4-Nbm9VBlGSckmknYKlFl2As_nl0SSRsN68Vzwkp7WK4TcPXWQ4rrlnir4pySt1CxXAi4rlZ5FP1Ls0yPmzYPQbxLVlCcBswIgJrxfnZQVe6LGgL_QkeJGMhUbZVSc0QLiee7_gyY628/s185/slime2-7.png';
  };

  const sizeInPixels = getSizeInPixels();

  return (
    <div
      className={`purple-imp-jello purple-imp-jello--${action}`}
      onClick={onClick}
      style={{
        width: sizeInPixels,
        height: sizeInPixels,
      }}
    >
      <img
        src={getImageUrl()}
        alt="Purple Imp Jello"
        className="purple-imp-jello__image"
        style={{
          width: '100%',
          height: '100%',
          imageRendering: 'pixelated',
        }}
      />
    </div>
  );
};

export default PurpleImpJello;
