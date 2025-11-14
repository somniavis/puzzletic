import React from 'react';
import type { Character, CharacterMood, CharacterAction } from '../../../../types/character';
import './BlueJello.css';

interface BlueJelloProps {
  character: Character;
  size?: 'small' | 'medium' | 'large';
  mood?: CharacterMood;
  action?: CharacterAction;
  onClick?: () => void;
}

export const BlueJello: React.FC<BlueJelloProps> = ({
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
    return 'https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEj7B_XMYTTfjPCJW_YFMpN-pcTn7bVvTlcifAcNTJuwLMW5OgWXnCWcQUj_1UAR-NbAO9K8-hC1tqQn0KFYAgwwMayCAQL_SWwXPBWGp6DlaiFcN0nHGPS3do1FGYngJJPdaef-O_cym23QUYhypCatxKve4cIGgwuoCsJ66gwFIjc9gfMy-TGAnvCTK7A/s185/slime1-5.png';
  };

  const sizeInPixels = getSizeInPixels();

  return (
    <div
      className={`blue-jello blue-jello--${action}`}
      onClick={onClick}
      style={{
        width: sizeInPixels,
        height: sizeInPixels,
      }}
    >
      <img
        src={getImageUrl()}
        alt="Blue Jello"
        className="blue-jello__image"
        style={{
          width: '100%',
          height: '100%',
          imageRendering: 'pixelated',
        }}
      />
    </div>
  );
};

export default BlueJello;
