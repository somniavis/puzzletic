import React from 'react';
import type { CharacterMood, CharacterAction } from '../../../../../types/character';
import './CyanGhostJello.css';

interface CyanGhostJelloProps {
  size?: 'small' | 'medium' | 'large';
  mood?: CharacterMood;
  action?: CharacterAction;
  onClick?: () => void;
}

export const CyanGhostJello: React.FC<CyanGhostJelloProps> = ({
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
    return 'https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEhNoipg52Zphysnu6GwJkRN93K2Bg1idSdXDWBwdK-pE3yAjCoP3dbAqpAbF8sSPtsr8JWGN3r9U3Rx3H1JcQeHHJVQ4kb73JJGG2HJPuNwR9RfmWlI_vOMaxPg1ThntY3CQY9AgWQXHIAyATw4ALSqoiT5s0gNHLTy6m37cW5krZIkH94rjR0pjnjpkmQ/s185/slime2-12.png';
  };

  const sizeInPixels = getSizeInPixels();

  return (
    <div
      className={`cyan-ghost-jello cyan-ghost-jello--${action}`}
      onClick={onClick}
      style={{
        width: sizeInPixels,
        height: sizeInPixels,
      }}
    >
      <img
        src={getImageUrl()}
        alt="Cyan Ghost Jello"
        className="cyan-ghost-jello__image"
        style={{
          width: '100%',
          height: '100%',
          imageRendering: 'pixelated',
        }}
      />
    </div>
  );
};

export default CyanGhostJello;
