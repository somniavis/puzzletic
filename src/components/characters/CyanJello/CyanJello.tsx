import React, { useState } from 'react';
import type { Character, CharacterMood, CharacterAction } from '../../../types/character';
import { EmotionBubble, getRandomEmotion, type EmotionType } from '../../EmotionBubble/EmotionBubble';
import './CyanJello.css';

interface CyanJelloProps {
  character: Character;
  size?: 'small' | 'medium' | 'large';
  mood?: CharacterMood;
  action?: CharacterAction;
  onClick?: () => void;
}

export const CyanJello: React.FC<CyanJelloProps> = ({
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
    return 'https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEiqSZ-leyjYYOA5vxDETyeug2-WupGIBKUeaZDyws9Ox4bVUBiLJC_GjCJ-KWRQH2ZKD-92PaB3MdvDMZ1FWM9LQ_sEsfVnw7Lsctu-6x8yviTXNOjp_BtywVWhCNFm9hfYafCeNQUk_4WuMwCFqYxlBslCnS2VkEDpm_9APEgLS2MIeSPdIkMAMaVHf_E/s185/slime1-12.png';
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
      className={`cyan-jello cyan-jello--${action}`}
      onClick={handleClick}
      style={{
        width: sizeInPixels,
        height: sizeInPixels,
      }}
    >
      {showEmotion && <EmotionBubble character={character} emotion={currentEmotion} />}
      <img
        src={getImageUrl()}
        alt="Cyan Jello"
        className="cyan-jello__image"
        style={{
          width: '100%',
          height: '100%',
          imageRendering: 'pixelated',
        }}
      />
    </div>
  );
};

export default CyanJello;
