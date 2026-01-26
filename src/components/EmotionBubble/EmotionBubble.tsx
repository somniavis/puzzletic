import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import type { EmotionCategory, EmotionExpression } from '../../types/emotion';
import type { PersonalityTrait } from '../../types/character';
import { emotionData } from '../../data/emotions';
import './EmotionBubble.css';

interface EmotionBubbleProps {
  category: EmotionCategory;
  level: 1 | 2 | 3;
  personality?: PersonalityTrait;
}

const getRandomExpression = (
  category: EmotionCategory,
  level: 1 | 2 | 3
): EmotionExpression | null => {
  const categoryData = emotionData[category];
  if (!categoryData) return null;

  const levelData = categoryData.find((l) => l.level === level);
  if (!levelData || levelData.expressions.length === 0) return null;

  const randomIndex = Math.floor(Math.random() * levelData.expressions.length);
  return levelData.expressions[randomIndex];
};

export const EmotionBubble: React.FC<EmotionBubbleProps> = ({
  category,
  level,
  personality,
}) => {
  const { t } = useTranslation();
  const [position, setPosition] = useState<'left' | 'right'>('right');
  const [expression, setExpression] = useState<EmotionExpression | null>(null);
  const [personalityMessage, setPersonalityMessage] = useState<string | null>(null);

  useEffect(() => {
    // 1. Get Base Expression (mostly for Emoji)
    const newExpression = getRandomExpression(category, level);
    setExpression(newExpression);

    // 2. Random Position
    const randomPosition = Math.random() > 0.5 ? 'right' : 'left';
    setPosition(randomPosition);

    // 3. Resolve Message
    if (personality) {
      // New Logic: Personality-based
      const key = `emotions.${category}.l${level}.${personality}`;
      const translated = t(key, { returnObjects: true }) as any;

      if (Array.isArray(translated) && translated.length > 0) {
        setPersonalityMessage(translated[Math.floor(Math.random() * translated.length)]);
      } else if (typeof translated === 'string' && translated.startsWith('emotions.')) {
        // Fallback if key missing (returns key itself usually)
        setPersonalityMessage(null);
      } else if (typeof translated === 'string') {
        setPersonalityMessage(translated);
      } else {
        setPersonalityMessage(null);
      }
    } else {
      setPersonalityMessage(null);
    }
  }, [category, level, personality, t]);

  if (!expression) {
    return null;
  }

  // Use personality message if available, otherwise fallback to legacy messageKey
  const message = personalityMessage || (expression ? t(expression.messageKey) : '');

  return (
    <div
      className={`emotion-bubble emotion-bubble--${position} emotion-bubble--visible`}
    >
      <div className="emotion-bubble__content">
        <span className="emotion-bubble__emoji">{expression.emoji}</span>
        {message && <span className="emotion-bubble__message">{message}</span>}
      </div>
      <div className="emotion-bubble__tail"></div>
    </div>
  );
};

export default EmotionBubble;