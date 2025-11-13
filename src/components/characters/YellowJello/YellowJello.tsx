import React, { useState } from 'react';
import type { Character, CharacterMood, CharacterAction } from '../../../types/character';
import { EmotionBubble, getRandomEmotion, type EmotionType } from '../../EmotionBubble/EmotionBubble';
import './YellowJello.css';

interface YellowJelloProps {
  character: Character;
  size?: 'small' | 'medium' | 'large';
  mood?: CharacterMood;
  action?: CharacterAction;
  onClick?: () => void;
}

export const YellowJello: React.FC<YellowJelloProps> = ({
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

  // Base image URL (stage 1)
  const getImageUrl = () => {
    // You can add different images for different moods/actions if needed
    return 'https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEhM7Keo6QrfjhrWbe5uy3bcIYBoj-YWGloRPfBcRxC8Ch1Vz5dMZBlY-PvuKGXPMOr-etzKr5rdCf_rTgeiRtUjZ6rIpH0Po4_TWOTmsWFccuqfubA8C8pnV9Eo0WVPDMertRrtzlT3AUoQSWjM8rReHkXAyKiDl6zBqoxvLtD9kEu7svHr6qInSX5x9IM/s185/slime1-1.png';
  };

  const sizeInPixels = getSizeInPixels();

  const handleClick = () => {
    if (showEmotion) {
      // Hide emotion bubble
      setShowEmotion(false);
    } else {
      // Show emotion bubble with random emotion
      const randomEmotion = getRandomEmotion();
      setCurrentEmotion(randomEmotion);
      setShowEmotion(true);
    }

    // Call original onClick if provided
    if (onClick) {
      onClick();
    }
  };

  return (
    <div
      className={`yellow-jello yellow-jello--${action}`}
      onClick={handleClick}
      style={{
        width: sizeInPixels,
        height: sizeInPixels,
      }}
    >
      {showEmotion && <EmotionBubble character={character} emotion={currentEmotion} />}
      <img
        src={getImageUrl()}
        alt="Yellow Jello"
        className="yellow-jello__image"
        style={{
          width: '100%',
          height: '100%',
          imageRendering: 'pixelated',
        }}
      />
    </div>
  );
};

export default YellowJello;
