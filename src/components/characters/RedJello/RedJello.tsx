import React, { useState } from 'react';
import type { Character, CharacterMood, CharacterAction } from '../../../types/character';
import { EmotionBubble, getRandomEmotion, type EmotionType } from '../../EmotionBubble/EmotionBubble';
import './RedJello.css';

interface RedJelloProps {
  character: Character;
  size?: 'small' | 'medium' | 'large';
  mood?: CharacterMood;
  action?: CharacterAction;
  onClick?: () => void;
}

export const RedJello: React.FC<RedJelloProps> = ({
  character,
  size = 'medium',
  action = 'idle',
  onClick,
}) => {
  const [showEmotion, setShowEmotion] = useState(false);
  const [currentEmotion, setCurrentEmotion] = useState<EmotionType>('hungry');
  const getSizeInPixels = () => {
    switch (size) {
      case 'small': return 96;
      case 'large': return 288;
      default: return 192;
    }
  };

  const getImageUrl = () => {
    return 'https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEgC4hy1fOzO4iZ75moVbVu4SqZVuJRs-dmNl59RLkrbRhDLJC6qhq1qNLVD9upZN1CUHLhmu4GVZAJVq37jrFiQE6aPBDS0Z6VaFbw_GjJFN205jgfy2R6T4Z-z1ZH9No2kALcWmZxjM668DSpctXoP7jXUUXDHkYjo_5GiQzHpkC8q2DpWPHzBjR1GSbc/s185/slime1-2.png';
  };

  const sizeInPixels = getSizeInPixels();

  const handleClick = () => {
    if (showEmotion) {
      setShowEmotion(false);
    } else {
      const randomEmotion = getRandomEmotion();
      setCurrentEmotion(randomEmotion);
      setShowEmotion(true);
    }

    if (onClick) {
      onClick();
    }
  };

  return (
    <div
      className={`red-jello red-jello--${action}`}
      onClick={handleClick}
      style={{
        width: sizeInPixels,
        height: sizeInPixels,
      }}
    >
      {showEmotion && <EmotionBubble character={character} emotion={currentEmotion} />}
      <img
        src={getImageUrl()}
        alt="Red Jello"
        className="red-jello__image"
        style={{
          width: '100%',
          height: '100%',
          imageRendering: 'pixelated',
        }}
      />
    </div>
  );
};

export default RedJello;
