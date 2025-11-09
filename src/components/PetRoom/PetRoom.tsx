import React, { useState, useEffect } from 'react';
import type { Character, CharacterMood, CharacterAction } from '../../types/character';
import { CHARACTERS } from '../characters';
import './PetRoom.css';

interface PetRoomProps {
  character: Character;
  speciesId: 'blueHero' | 'greenSlime';
  onStatsChange: (stats: Partial<Character['stats']>) => void;
}

export const PetRoom: React.FC<PetRoomProps> = ({ character, speciesId, onStatsChange }) => {
  const [mood, setMood] = useState<CharacterMood>('neutral');
  const [action, setAction] = useState<CharacterAction>('idle');
  const [position, setPosition] = useState({ x: 50, y: 50 }); // percentage position
  const [isMoving, setIsMoving] = useState(false);

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
    const { happiness, health, hunger } = character.stats;
    if (health < 30 || hunger > 80) {
      setMood('sad');
    } else if (happiness > 70 && hunger < 40) {
      setMood('happy');
    } else {
      setMood('neutral');
    }
  }, [character.stats]);

  const handleFeed = () => {
    setAction('eating');
    onStatsChange({
      hunger: Math.max(0, character.stats.hunger - 20),
      happiness: Math.min(100, character.stats.happiness + 5),
    });
    setTimeout(() => setAction('idle'), 2000);
  };

  const handleWash = () => {
    setAction('happy');
    onStatsChange({
      hygiene: Math.min(100, character.stats.hygiene + 25),
      happiness: Math.min(100, character.stats.happiness + 10),
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
            <div className="profile-level">Lv.{character.level}</div>
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

      {/* Bottom Action Bar */}
      <div className="action-bar">
        <button
          className="action-btn action-btn--small"
          onClick={handleFeed}
          disabled={action !== 'idle'}
        >
          <span className="action-icon">🍖</span>
        </button>
        <button
          className="action-btn action-btn--small"
          onClick={handleWash}
          disabled={action !== 'idle'}
        >
          <span className="action-icon">🛁</span>
        </button>
        <button
          className="action-btn action-btn--main"
          onClick={handlePlay}
          disabled={action !== 'idle'}
        >
          <span className="action-icon-large">🎾</span>
          <span className="action-label">놀아주기</span>
        </button>
        <button
          className="action-btn action-btn--small"
          onClick={handleClean}
          disabled={action !== 'idle'}
        >
          <span className="action-icon">🧹</span>
        </button>
        <button
          className="action-btn action-btn--small"
          disabled={action !== 'idle'}
        >
          <span className="action-icon">⚙️</span>
        </button>
      </div>
    </div>
  );
};

export default PetRoom;
