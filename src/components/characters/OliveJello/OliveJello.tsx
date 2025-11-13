import React, { useState } from 'react';
import type { Character, CharacterMood, CharacterAction } from '../../../types/character';
import { EmotionBubble, getRandomEmotion, type EmotionType } from '../../EmotionBubble/EmotionBubble';
import './OliveJello.css';

interface OliveJelloProps {
  character: Character;
  size?: 'small' | 'medium' | 'large';
  mood?: CharacterMood;
  action?: CharacterAction;
  onClick?: () => void;
}

export const OliveJello: React.FC<OliveJelloProps> = ({
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
    return 'https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEixFBIj75hUyV-YctAYsyfzbvVdnRqONwGjkYdBX9d-qITWc0_WplcMO5Uu0zke8BSYUbzus9iVxQRZg0R_4vPzDvKfdFhbKwAqN5MhtyfGpUZEirwJCWyYD8XqquPQvKVtYESPnLrarRFOmhafU1eSqd-b0lZlvBDVpSjZEXKPqZty9_gET-oTYdhQgZQ/s185/slime1-11.png';
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
      className={`olive-jello olive-jello--${action}`}
      onClick={handleClick}
      style={{
        width: sizeInPixels,
        height: sizeInPixels,
      }}
    >
      {showEmotion && <EmotionBubble character={character} emotion={currentEmotion} />}
      <img
        src={getImageUrl()}
        alt="Olive Jello"
        className="olive-jello__image"
        style={{
          width: '100%',
          height: '100%',
          imageRendering: 'pixelated',
        }}
      />
    </div>
  );
};

export default OliveJello;
