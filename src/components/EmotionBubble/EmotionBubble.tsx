import React, { useState, useEffect } from 'react';
import type { Character } from '../../types/character';
import './EmotionBubble.css';

export type EmotionType =
  | 'neutral'
  | 'hungry'
  | 'sick'
  | 'happy'
  | 'sad'
  | 'sleepy'
  | 'surprised'
  | 'excited'
  | 'angry';

interface EmotionBubbleProps {
  character: Character;
  emotion?: EmotionType;
  onToggle?: () => void;
}

const EMOTION_EMOJIS: Record<EmotionType, string> = {
  neutral: '😐',
  hungry: '🍔',
  sick: '🤒',
  happy: '😊',
  sad: '😢',
  sleepy: '😴',
  surprised: '😲',
  excited: '🤩',
  angry: '😠',
};

const ALL_EMOTIONS: EmotionType[] = [
  'neutral', 'hungry', 'sick', 'happy', 'sad', 'sleepy', 'surprised', 'excited', 'angry'
];

export const EmotionBubble: React.FC<EmotionBubbleProps> = ({
  character,
  emotion: propEmotion,
  onToggle
}) => {
  const [position, setPosition] = useState<'left' | 'right'>('right');
  const [isVisible, setIsVisible] = useState(true);
  const [currentEmotion, setCurrentEmotion] = useState<EmotionType>(propEmotion || 'hungry');

  // Update emotion when prop changes
  useEffect(() => {
    if (propEmotion) {
      setCurrentEmotion(propEmotion);
      // Random position when emotion changes
      const randomPosition = Math.random() > 0.5 ? 'right' : 'left';
      setPosition(randomPosition);
    }
  }, [propEmotion]);

  const emoji = EMOTION_EMOJIS[currentEmotion];

  return (
    <div
      className={`emotion-bubble emotion-bubble--${position} ${isVisible ? 'emotion-bubble--visible' : ''}`}
    >
      <div className="emotion-bubble__content">
        <span className="emotion-bubble__emoji">{emoji}</span>
      </div>
      <div className="emotion-bubble__tail"></div>
    </div>
  );
};

// Export function to get random emotion
export const getRandomEmotion = (): EmotionType => {
  const randomIndex = Math.floor(Math.random() * ALL_EMOTIONS.length);
  return ALL_EMOTIONS[randomIndex];
};

export default EmotionBubble;
