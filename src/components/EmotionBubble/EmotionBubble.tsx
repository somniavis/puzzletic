import React, { useMemo } from 'react';
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

  // 1. Calculate Random Values only once per instance (or when dependencies change)
  const { position, expression, message } = useMemo(() => {
    // Random Position
    const pos = Math.random() > 0.5 ? 'right' : 'left';

    // Base Expression (Emoji)
    const expr = getRandomExpression(category, level);

    // Resolve Message
    let msg: string | null = null;

    if (personality) {
      // New: Personality-based message
      const key = `emotions.${category}.l${level}.${personality}`;
      const translated = t(key, { returnObjects: true }) as string | string[];

      if (Array.isArray(translated) && translated.length > 0) {
        msg = translated[Math.floor(Math.random() * translated.length)];
      } else if (typeof translated === 'string' && !translated.startsWith('emotions.')) {
        msg = translated; // Single string value
      }
    }

    // Fallback: Legacy message key
    if (!msg && expr) {
      msg = t(expr.messageKey);
    }

    return { position: pos, expression: expr, message: msg };
  }, [category, level, personality, t]);

  if (!expression) {
    return null;
  }

  return (
    <div
      className={`emotion-bubble emotion-bubble--${position} emotion-bubble--visible`}
    >
      <div className="emotion-bubble__content">
        {message && <span className="emotion-bubble__message">{message}</span>}
      </div>
      <div className="emotion-bubble__tail"></div>
    </div>
  );
};

export default EmotionBubble;