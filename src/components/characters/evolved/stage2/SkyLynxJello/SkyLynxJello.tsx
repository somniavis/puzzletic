import React from 'react';
import type { CharacterMood, CharacterAction } from '../../../../../types/character';
import './SkyLynxJello.css';

interface SkyLynxJelloProps {
  size?: 'small' | 'medium' | 'large';
  mood?: CharacterMood;
  action?: CharacterAction;
  onClick?: () => void;
}

export const SkyLynxJello: React.FC<SkyLynxJelloProps> = ({
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
    return 'https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEjwnL8Nono0eu4QpBtYMEslpToXOvKz9Amq8IXmQJS-OwUPOo0BbRnY1vph5dRkVLT4m1OwNm42oWWWN5WDgTh1zYn0kb0nCp5_BO40D1oObAnk1iiQ3vyB2tlSlUKq73CjDVrm7nu3cRZyk-OfaBL4llebH5MZXjD29GfiWINMdumi31EowDcRatTOkC4/s185/slime2-8.png';
  };

  const sizeInPixels = getSizeInPixels();

  return (
    <div
      className={`sky-lynx-jello sky-lynx-jello--${action}`}
      onClick={onClick}
      style={{
        width: sizeInPixels,
        height: sizeInPixels,
      }}
    >
      <img
        src={getImageUrl()}
        alt="Sky Lynx Jello"
        className="sky-lynx-jello__image"
        style={{
          width: '100%',
          height: '100%',
          imageRendering: 'pixelated',
        }}
      />
    </div>
  );
};

export default SkyLynxJello;
