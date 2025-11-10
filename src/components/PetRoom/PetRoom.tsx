import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import type { Character, CharacterMood, CharacterAction } from '../../types/character';
import { CHARACTERS } from '../characters';
import { FOOD_ITEMS, FOOD_CATEGORIES, type FoodItem, type FoodCategory } from '../../types/food';
import './PetRoom.css';

interface PetRoomProps {
  character: Character;
  speciesId: 'blueHero' | 'greenSlime';
  onStatsChange: (stats: Partial<Character['stats']>) => void;
}

export const PetRoom: React.FC<PetRoomProps> = ({ character, speciesId, onStatsChange }) => {
  const { t } = useTranslation();
  const [mood, setMood] = useState<CharacterMood>('neutral');
  const [action, setAction] = useState<CharacterAction>('idle');
  const [position, setPosition] = useState({ x: 50, y: 50 }); // percentage position
  const [isMoving, setIsMoving] = useState(false);
  const [showFoodMenu, setShowFoodMenu] = useState(false);
  const [selectedFoodCategory, setSelectedFoodCategory] = useState<FoodCategory>('meal');

  // Auto-move character randomly
  useEffect(() => {
    const moveInterval = setInterval(() => {
      if (!isMoving && Math.random() > 0.7) {
        const newX = Math.max(10, Math.min(90, position.x + (Math.random() - 0.5) * 30));
        const newY = Math.max(20, Math.min(80, position.y + (Math.random() - 0.5) * 20));
        setPosition({ x: newX, y: newY });
        setIsMoving(true);
        setTimeout(() => setIsMoving(false), 1000);
      }
    }, 3000);

    return () => clearInterval(moveInterval);
  }, [position, isMoving]);

  // Update mood based on stats
  useEffect(() => {
    const { happiness, health, hunger, fatigue } = character.stats;

    // Very bad condition - sad
    if (health < 30 || hunger > 80) {
      setMood('sad');
    }
    // Tired - sleeping
    else if (fatigue > 70) {
      setMood('sleeping');
    }
    // Very happy - excited
    else if (happiness > 85 && hunger < 30 && health > 80) {
      setMood('excited');
    }
    // Happy condition
    else if (happiness > 70 && hunger < 50) {
      setMood('happy');
    }
    // Default - neutral
    else {
      setMood('neutral');
    }
  }, [character.stats]);

  const handleFeed = (food: FoodItem) => {
    setAction('eating');
    const newStats: Partial<Character['stats']> = {
      hunger: Math.max(0, character.stats.hunger + food.effects.hunger),
      happiness: Math.min(100, character.stats.happiness + food.effects.happiness),
    };
    if (food.effects.health) {
      newStats.health = Math.min(100, character.stats.health + food.effects.health);
    }
    onStatsChange(newStats);
    setShowFoodMenu(false);
    setTimeout(() => setAction('idle'), 2000);
  };

  const toggleFoodMenu = () => {
    setShowFoodMenu(!showFoodMenu);
  };

  const filteredFoods = FOOD_ITEMS.filter(food => food.category === selectedFoodCategory);

  const handleMedicine = () => {
    setAction('happy');
    onStatsChange({
      health: Math.min(100, character.stats.health + 30),
      happiness: Math.min(100, character.stats.happiness + 5),
    });
    setTimeout(() => setAction('idle'), 2000);
  };

  const handleClean = () => {
    setAction('jumping');
    onStatsChange({
      hygiene: Math.min(100, character.stats.hygiene + 15),
      health: Math.min(100, character.stats.health + 5),
    });
    setTimeout(() => setAction('idle'), 2000);
  };

  const handlePlay = () => {
    setAction('playing');
    onStatsChange({
      happiness: Math.min(100, character.stats.happiness + 20),
      fatigue: Math.min(100, character.stats.fatigue + 10),
      affection: Math.min(100, character.stats.affection + 5),
    });
    setTimeout(() => setAction('idle'), 3000);
  };

  const CharacterComponent = CHARACTERS[speciesId];

  return (
    <div className="pet-room">
      {/* Top Header with Character Info */}
      <div className="game-header">
        <div className="character-profile">
          <div className="profile-avatar">
            <CharacterComponent
              character={character}
              size="small"
              mood={mood}
              action="idle"
            />
          </div>
          <div className="profile-info">
            <div className="profile-name">{character.name}</div>
            <div className="profile-level">{t('character.profile.level', { level: character.level })}</div>
          </div>
        </div>

        <div className="stats-row">
          <div className="stat-badge stat-badge--hunger">
            <span className="stat-icon">🍖</span>
            <span className="stat-value">{100 - character.stats.hunger}</span>
          </div>
          <div className="stat-badge stat-badge--happiness">
            <span className="stat-icon">❤️</span>
            <span className="stat-value">{character.stats.happiness}</span>
          </div>
          <div className="stat-badge stat-badge--health">
            <span className="stat-icon">💚</span>
            <span className="stat-value">{character.stats.health}</span>
          </div>
        </div>
      </div>

      {/* Main Room Area */}
      <div className="room-container">
        <div className="room-background">
          <div className="room-floor" />
          <div className="room-wall" />
        </div>

        {/* Character */}
        <div
          className="character-container"
          style={{
            left: `${position.x}%`,
            bottom: `${position.y}%`,
            transform: 'translate(-50%, 50%)',
          }}
        >
          <CharacterComponent
            character={character}
            size="small"
            mood={mood}
            action={action}
          />
        </div>
      </div>

      {/* Food Menu Submenu */}
      {showFoodMenu && (
        <div className="food-menu-overlay" onClick={() => setShowFoodMenu(false)}>
          <div className="food-menu" onClick={(e) => e.stopPropagation()}>
            <div className="food-menu-header">
              <h3>{t('food.menu.title')}</h3>
              <button className="close-btn" onClick={() => setShowFoodMenu(false)}>✕</button>
            </div>

            <div className="food-categories">
              {(Object.keys(FOOD_CATEGORIES) as FoodCategory[]).map((category) => (
                <button
                  key={category}
                  className={`category-tab ${selectedFoodCategory === category ? 'active' : ''}`}
                  onClick={() => setSelectedFoodCategory(category)}
                >
                  <span className="category-icon">{FOOD_CATEGORIES[category].icon}</span>
                  <span className="category-name">{t(FOOD_CATEGORIES[category].nameKey)}</span>
                </button>
              ))}
            </div>

            <div className="food-items-grid">
              {filteredFoods.map((food) => (
                <button
                  key={food.id}
                  className="food-item"
                  onClick={() => handleFeed(food)}
                  disabled={action !== 'idle'}
                >
                  <span className="food-item-icon">{food.icon}</span>
                  <span className="food-item-name">{t(food.nameKey)}</span>
                  <div className="food-item-effects">
                    {food.effects.hunger < 0 && (
                      <span className="effect">🍖 {-food.effects.hunger}</span>
                    )}
                    {food.effects.happiness > 0 && (
                      <span className="effect">❤️ +{food.effects.happiness}</span>
                    )}
                    {food.effects.health && food.effects.health > 0 && (
                      <span className="effect">💚 +{food.effects.health}</span>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Bottom Action Bar */}
      <div className="action-bar">
        <button
          className="action-btn action-btn--small"
          onClick={toggleFoodMenu}
          disabled={action !== 'idle'}
          title={t('actions.feed')}
        >
          <span className="action-icon">🍖</span>
        </button>
        <button
          className="action-btn action-btn--small"
          onClick={handleMedicine}
          disabled={action !== 'idle'}
          title={t('actions.medicine')}
        >
          <span className="action-icon">💊</span>
        </button>
        <button
          className="action-btn action-btn--main"
          onClick={handlePlay}
          disabled={action !== 'idle'}
        >
          <span className="action-icon-large">🎾</span>
          <span className="action-label">{t('actions.play')}</span>
        </button>
        <button
          className="action-btn action-btn--small"
          onClick={handleClean}
          disabled={action !== 'idle'}
          title={t('actions.clean')}
        >
          <span className="action-icon">🧹</span>
        </button>
        <button
          className="action-btn action-btn--small"
          disabled={action !== 'idle'}
          title={t('actions.settings')}
        >
          <span className="action-icon">⚙️</span>
        </button>
      </div>
    </div>
  );
};

export default PetRoom;
