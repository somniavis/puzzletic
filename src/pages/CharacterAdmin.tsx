import React, { useState } from 'react';
import type { EvolutionStage } from '../types/character';
import { CHARACTER_SPECIES } from '../data/species';
import { CharacterGallery } from '../components/CharacterGallery/CharacterGallery';
import './CharacterAdmin.css';

interface CharacterAdminProps {
  onCharacterSelect?: (speciesId: string) => void;
}

export const CharacterAdmin: React.FC<CharacterAdminProps> = ({ onCharacterSelect }) => {
  const [selectedStage, setSelectedStage] = useState<EvolutionStage>(1);
  const [selectedSpecies, setSelectedSpecies] = useState<string | null>(null);

  const allSpecies = Object.values(CHARACTER_SPECIES);

  const handleStageChange = (stage: EvolutionStage) => {
    setSelectedStage(stage);
  };

  const handleSpeciesSelect = (speciesId: string) => {
    setSelectedSpecies(speciesId);
    console.log('Selected species:', speciesId);
    // Call parent callback if provided
    if (onCharacterSelect) {
      onCharacterSelect(speciesId);
    }
  };

  return (
    <div className="character-admin">
      <div className="admin-header">
        <h1>Character Gallery</h1>
        <p>Browse all characters by evolution stage</p>
      </div>

      <div className="stage-selector">
        <button
          className={`stage-btn ${selectedStage === 1 ? 'active' : ''}`}
          onClick={() => handleStageChange(1)}
        >
          <span className="stage-icon">🥚</span>
          <span className="stage-label">Stage 1</span>
          <span className="stage-sublabel">Beginner</span>
        </button>
        <button
          className={`stage-btn ${selectedStage === 2 ? 'active' : ''}`}
          onClick={() => handleStageChange(2)}
        >
          <span className="stage-icon">⚔️</span>
          <span className="stage-label">Stage 2</span>
          <span className="stage-sublabel">Advanced</span>
        </button>
        <button
          className={`stage-btn ${selectedStage === 3 ? 'active' : ''}`}
          onClick={() => handleStageChange(3)}
        >
          <span className="stage-icon">👑</span>
          <span className="stage-label">Stage 3</span>
          <span className="stage-sublabel">Master</span>
        </button>
      </div>

      <div className="gallery-container">
        <div className="gallery-info">
          <h2>Stage {selectedStage} Characters</h2>
          <p>
            {selectedStage === 1 && 'These are the starter characters available for adoption.'}
            {selectedStage === 2 && 'Characters evolve to this stage with training and care.'}
            {selectedStage === 3 && 'The ultimate form - achieved through mastery and dedication.'}
          </p>
        </div>

        <CharacterGallery
          species={allSpecies}
          selectedStage={selectedStage}
          onSelect={handleSpeciesSelect}
        />
      </div>

      {selectedSpecies && (
        <div className="selection-info">
          <p>Selected: <strong>{CHARACTER_SPECIES[selectedSpecies]?.name}</strong></p>
        </div>
      )}
    </div>
  );
};

export default CharacterAdmin;
