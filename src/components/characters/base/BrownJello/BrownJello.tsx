import React from 'react';
import type { Character, CharacterMood, CharacterAction } from '../../../../types/character';
import './BrownJello.css';

interface BrownJelloProps {
  character: Character;
  size?: 'small' | 'medium' | 'large';
  mood?: CharacterMood;
  action?: CharacterAction;
  onClick?: () => void;
}

export const BrownJello: React.FC<BrownJelloProps> = ({
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
    return 'https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEinUxaEzVZ55RlAAXx1Eq-vInQgnsWHAkpDzTEExCk5_OtnyN6sqHnSrV4bj1Ik5RD7fsQJ6to-dUVjuE5h0i5lDcwooSAoQecXq4sRo2qCaa3lm8BYeIAHF8rVl_2KNf6voI56_MCMaR1cd7VYkeYkBzOrbxH34HbenTjUeyojh0OMOaMmFx4Z73YUN7E/s185/slime1-9.png';
  };

  const sizeInPixels = getSizeInPixels();

  return (
    <div
      className={`brown-jello brown-jello--${action}`}
      onClick={onClick}
      style={{
        width: sizeInPixels,
        height: sizeInPixels,
      }}
    >
      <img
        src={getImageUrl()}
        alt="Brown Jello"
        className="brown-jello__image"
        style={{
          width: '100%',
          height: '100%',
          imageRendering: 'pixelated',
        }}
      />
    </div>
  );
};

export default BrownJello;
