import React from 'react';
import type { Character, CharacterMood, CharacterAction } from '../../../../types/character';
import './OrangeJello.css';

interface OrangeJelloProps {
  character: Character;
  size?: 'small' | 'medium' | 'large';
  mood?: CharacterMood;
  action?: CharacterAction;
  onClick?: () => void;
}

export const OrangeJello: React.FC<OrangeJelloProps> = ({
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
    return 'https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEj28Cl04ywwqUP12JIEGGMmufZfb6WdpiKr5KmgJVkKwzGROZfhsxlJVI32_unEgNF0dCT8SQ85pqhfbUadz50q5tkZo1KQEpj2ljlnE2S4ePkLgYV6pbIMZdVpHeXHdn1lClwMukmKy_3tPzQWJhepbOSwvgtYYgxO0tg39pd-IZWU4YJBrSUZrLT_xTE/s185/slime1-10.png';
  };

  const sizeInPixels = getSizeInPixels();

  return (
    <div
      className={`orange-jello orange-jello--${action}`}
      onClick={onClick}
      style={{
        width: sizeInPixels,
        height: sizeInPixels,
      }}
    >
      <img
        src={getImageUrl()}
        alt="Orange Jello"
        className="orange-jello__image"
        style={{
          width: '100%',
          height: '100%',
          imageRendering: 'pixelated',
        }}
      />
    </div>
  );
};

export default OrangeJello;
