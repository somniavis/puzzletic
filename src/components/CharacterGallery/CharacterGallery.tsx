import React from 'react';
import type { CharacterSpecies, EvolutionStage } from '../../types/character';
import { CHARACTERS } from '../characters';
import { createCharacter } from '../../data/characters';
import './CharacterGallery.css';

interface CharacterGalleryProps {
  species: CharacterSpecies[];
  selectedStage?: EvolutionStage;
  onSelect?: (speciesId: string) => void;
}

// Mapping from base species ID + stage to evolved character component key
const EVOLUTION_COMPONENT_MAP: Record<string, Record<number, keyof typeof CHARACTERS>> = {
  yellowJello: { 1: 'yellowJello', 2: 'yellowPearJello', 3: 'yellowJello' },
  redJello: { 1: 'redJello', 2: 'redDevilJello', 3: 'redJello' },
  limeJello: { 1: 'limeJello', 2: 'limeLeafJello', 3: 'limeJello' },
  mintJello: { 1: 'mintJello', 2: 'mintSproutJello', 3: 'mintJello' },
  blueJello: { 1: 'blueJello', 2: 'blueCatJello', 3: 'blueJello' },
  creamJello: { 1: 'creamJello', 2: 'creamRamJello', 3: 'creamJello' },
  purpleJello: { 1: 'purpleJello', 2: 'purpleImpJello', 3: 'purpleJello' },
  skyJello: { 1: 'skyJello', 2: 'skyLynxJello', 3: 'skyJello' },
  brownJello: { 1: 'brownJello', 2: 'brownWillowJello', 3: 'brownJello' },
  orangeJello: { 1: 'orangeJello', 2: 'orangeTailJello', 3: 'orangeJello' },
  oliveJello: { 1: 'oliveJello', 2: 'oliveBloomJello', 3: 'oliveJello' },
  cyanJello: { 1: 'cyanJello', 2: 'cyanGhostJello', 3: 'cyanJello' },
};

export const CharacterGallery: React.FC<CharacterGalleryProps> = ({
  species,
  selectedStage = 1,
  onSelect,
}) => {
  const renderCharacter = (speciesId: string, stage: EvolutionStage) => {
    // Get the appropriate component key based on species and stage
    const componentKey = EVOLUTION_COMPONENT_MAP[speciesId]?.[stage] || speciesId;
    const CharacterComponent = CHARACTERS[componentKey as keyof typeof CHARACTERS];

    if (!CharacterComponent) {
      return (
        <div className="character-placeholder">
          <div className="placeholder-box">?</div>
          <p>Coming Soon</p>
        </div>
      );
    }

    const character = createCharacter(speciesId);

    return (
      <CharacterComponent
        character={character}
        size="medium"
        mood="neutral"
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
