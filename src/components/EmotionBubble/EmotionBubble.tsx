import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import type { EmotionCategory, EmotionExpression } from '../../types/emotion';
import { emotionData } from '../../data/emotions';
import './EmotionBubble.css';

interface EmotionBubbleProps {
  category: EmotionCategory;
  level: 1 | 2 | 3;
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
}) => {
  const { t } = useTranslation();
  const [position, setPosition] = useState<'left' | 'right'>('right');
  const [expression, setExpression] = useState<EmotionExpression | null>(null);

  useEffect(() => {
    const newExpression = getRandomExpression(category, level);
    setExpression(newExpression);

    const randomPosition = Math.random() > 0.5 ? 'right' : 'left';
    setPosition(randomPosition);
  }, [category, level]);

  if (!expression) {
    return null;
  }

  const { emoji, messageKey } = expression;
  const message = t(messageKey);
  console.log(`Translating ${messageKey}: ${message}`);

  return (
    <div
      className={`emotion-bubble emotion-bubble--${position} emotion-bubble--visible`}
    >
      <div className="emotion-bubble__content">
        <span className="emotion-bubble__emoji">{emoji}</span>
        {message && <span className="emotion-bubble__message">{message}</span>}
      </div>
      <div className="emotion-bubble__tail"></div>
    </div>
  );
};

export default EmotionBubble;