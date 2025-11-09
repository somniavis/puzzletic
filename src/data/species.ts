import type { CharacterSpecies, EvolutionStage } from '../types/character';

export const CHARACTER_SPECIES: Record<string, CharacterSpecies> = {
  greenSlime: {
    id: 'greenSlime',
    name: 'Green Slime',
    description: 'A bouncy, cheerful slime that loves to jiggle.',
    evolutions: [
      {
        stage: 1,
        name: 'Slime Drop',
        requiredLevel: 1,
        requiredAffection: 0,
        description: 'A small, pure droplet of slime.',
      },
      {
        stage: 2,
        name: 'Jelly Slime',
        requiredLevel: 10,
        requiredAffection: 50,
        description: 'A bigger, more expressive slime.',
      },
      {
        stage: 3,
        name: 'King Slime',
        requiredLevel: 25,
        requiredAffection: 80,
        description: 'The ruler of all slimes, regal and jiggly.',
      },
    ],
  },
  blueHero: {
    id: 'blueHero',
    name: 'Blue Hero',
    description: 'A brave warrior with a strong sense of justice.',
    evolutions: [
      {
        stage: 1,
        name: 'Blue Squire',
        requiredLevel: 1,
        requiredAffection: 0,
        description: 'A hero in training, full of potential.',
      },
      {
        stage: 2,
        name: 'Blue Knight',
        requiredLevel: 12,
        requiredAffection: 60,
        description: 'A sworn protector of the innocent.',
      },
      {
        stage: 3,
        name: 'Blue Paladin',
        requiredLevel: 28,
        requiredAffection: 90,
        description: 'A legendary champion of light.',
      },
    ],
  },
};

/**
 * Gets the name of a specific evolution stage for a character species.
 * @param speciesId The ID of the character species.
 * @param stage The evolution stage.
 * @returns The name of the evolution, or the base species name if not found.
 */
export function getEvolutionName(speciesId: string, stage: EvolutionStage): string {
  const species = CHARACTER_SPECIES[speciesId];
  if (!species) {
    return 'Unknown';
  }
  const evolution = species.evolutions.find(e => e.stage === stage);
  return evolution?.name || species.name;
}
