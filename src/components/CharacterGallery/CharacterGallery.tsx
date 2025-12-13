import React from 'react';
import type { CharacterSpecies, EvolutionStage } from '../../types/character';
import { JelloAvatar } from '../characters/JelloAvatar';
import { createCharacter } from '../../data/characters';
import './CharacterGallery.css';

interface CharacterGalleryProps {
  species: CharacterSpecies[];
  selectedStage?: EvolutionStage;
  onSelect?: (speciesId: string) => void;
}

export const CharacterGallery: React.FC<CharacterGalleryProps> = ({
  species,
  selectedStage = 1,
  onSelect,
}) => {
  const renderCharacter = (speciesId: string, stage: EvolutionStage) => {
    const character = createCharacter(speciesId);
    // Force the stage for preview
    character.evolutionStage = stage;

    return (
      <JelloAvatar
        character={character}
        speciesId={speciesId}
        size="medium"
        // mood="neutral"
        action="idle"
        onClick={() => onSelect?.(speciesId)}
      />
    );
  };

  return (
    <div className="character-gallery">
      {species.map((spec) => {
        const evolution = spec.evolutions.find(e => e.stage === selectedStage);

        return (
          <div
            key={spec.id}
            className="character-card"
            onClick={() => onSelect?.(spec.id)}
          >
            <div className="character-preview">
              {renderCharacter(spec.id, selectedStage)}
            </div>
            <div className="character-info">
              <h3>{evolution?.name || spec.name}</h3>
              <p className="character-description">{spec.description}</p>
              {evolution && (
                <div className="evolution-requirements">
                  <span className="badge">Stage {evolution.stage}</span>
                  {evolution.requiredLevel > 1 && (
                    <span className="requirement">Lvl {evolution.requiredLevel}+</span>
                  )}
                  {evolution.requiredAffection > 0 && (
                    <span className="requirement">❤ {evolution.requiredAffection}+</span>
                  )}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default CharacterGallery;
