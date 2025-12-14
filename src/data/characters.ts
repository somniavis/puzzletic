import type { Character, EvolutionStage } from '../types/character';
import { CHARACTER_SPECIES, getEvolutionName } from './species';

// Initial stats for stage 1 characters
const DEFAULT_STAGE_1_STATS = {
  hunger: 50,
  happiness: 70,
  health: 100,
  hygiene: 80,
  fatigue: 30,
  affection: 50,
  intelligence: 40,
  stamina: 60,
};

// Helper function to create a new character from species
export const createCharacter = (speciesId: string, customName?: string): Character => {
  const species = CHARACTER_SPECIES[speciesId];
  if (!species) {
    throw new Error(`Unknown species: ${speciesId}`);
  }

  const stage: EvolutionStage = 1;
  const evolutionName = getEvolutionName(speciesId, stage);

  return {
    id: `${speciesId}-${Date.now()}`,
    speciesId,
    name: customName || evolutionName,
    type: speciesId, // For backwards compatibility
    level: 1,
    experience: 0,
    evolutionStage: stage,
    stats: { ...DEFAULT_STAGE_1_STATS },
    currentMood: 'neutral',
    currentAction: 'idle',
    xp: 0,
    gro: 0,
    tendencies: {
      intelligence: 0,
      creativity: 0,
      physical: 0,
      social: 0,
      discipline: 0,
      exploration: 0,
    },
    gamesPlayed: 0,
    lastPlayTime: null,
    history: {
      foodsEaten: {},
      gamesPlayed: {},
      actionsPerformed: {},
      totalLifetimeGroEarned: 0,
    },
  };
};
