import React from 'react';
import type { CharacterMood, CharacterAction } from '../../../../../types/character';
import './RedDevilJello.css';

interface RedDevilJelloProps {
  size?: 'small' | 'medium' | 'large';
  mood?: CharacterMood;
  action?: CharacterAction;
  onClick?: () => void;
}

export const RedDevilJello: React.FC<RedDevilJelloProps> = ({
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
    return 'https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEhp32ZLTCN7v04cZ5Ig64f9WjH-xujSHYA4AOjfgLv-cK4TxSQKiNZe4qd_ydhNUS9MkadJQi3VLy9CnhIKAzoCcyLOwfbUDxgfJvuXb9xMbdRJfxjwmYzE1S3d8mVGXXsCs-8Z_3Rp6r2DBPIpKAjiT95WM6Tx3BSepPrBfDstc6-BcuS-kmr-CCW7U10/s185/slime2-2.png';
  };

  const sizeInPixels = getSizeInPixels();

  return (
    <div
      className={`red-devil-jello red-devil-jello--${action}`}
      onClick={onClick}
      style={{
        width: sizeInPixels,
        height: sizeInPixels,
      }}
    >
      <img
        src={getImageUrl()}
        alt="Red Devil Jello"
        className="red-devil-jello__image"
        style={{
          width: '100%',
          height: '100%',
          imageRendering: 'pixelated',
        }}
      />
    </div>
  );
};

export default RedDevilJello;
