import React from 'react';
import type { Character, CharacterMood, CharacterAction } from '../../../../types/character';
import './LimeJello.css';

interface LimeJelloProps {
  character: Character;
  size?: 'small' | 'medium' | 'large';
  mood?: CharacterMood;
  action?: CharacterAction;
  onClick?: () => void;
}

export const LimeJello: React.FC<LimeJelloProps> = ({
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
    return 'https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEig6r3HEDxxXAk6VWVHQRCL3vd7iqiTWnx4q9eaYTlncxp91sG7uptGjQkDSCXhQT1nzLu6P8XuwurCXFWoN0WP26wXATdi8_SIseCPSDIq5djcXtwdW1YZCj_B6CDhuXn5arhz_ZV1V2XPXy-9DaVe2J_BXf1dQepfYq5KkrjyD23KvxaON2yOe0RIsHk/s185/slime1-3.png';
  };

  const sizeInPixels = getSizeInPixels();

  return (
    <div
      className={`lime-jello lime-jello--${action}`}
      onClick={onClick}
      style={{
        width: sizeInPixels,
        height: sizeInPixels,
      }}
    >
      <img
        src={getImageUrl()}
        alt="Lime Jello"
        className="lime-jello__image"
        style={{
          width: '100%',
          height: '100%',
          imageRendering: 'pixelated',
        }}
      />
    </div>
  );
};

export default LimeJello;
