import React from 'react';
import type { CharacterMood, CharacterAction } from '../../../../../types/character';
import './YellowPearJello.css';

interface YellowPearJelloProps {
  size?: 'small' | 'medium' | 'large';
  mood?: CharacterMood;
  action?: CharacterAction;
  onClick?: () => void;
}

export const YellowPearJello: React.FC<YellowPearJelloProps> = ({
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
    return 'https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEi2d655-Ej8OMl0zMy1iR4xbW0kIt4XbHTRM4RcWeXJCviiDccq02FrW9-g2PhYy_6XQKUkcpG8ZaEP_NvMQKqCconpvUB9oKPVWKn_dw91-kViFi4OJ5QsmcMf3RC66CETjCo8SzFJofbQQ6Tes2r7A2BTokwF2A4oiN9EqAqvBG1VPvaZ1z7OE_syqo4/s185/slime2-1.png';
  };

  const sizeInPixels = getSizeInPixels();

  return (
    <div
      className={`yellow-pear-jello yellow-pear-jello--${action}`}
      onClick={onClick}
      style={{
        width: sizeInPixels,
        height: sizeInPixels,
      }}
    >
      <img
        src={getImageUrl()}
        alt="Yellow Pear Jello"
        className="yellow-pear-jello__image"
        style={{
          width: '100%',
          height: '100%',
          imageRendering: 'pixelated',
        }}
      />
    </div>
  );
};

export default YellowPearJello;
