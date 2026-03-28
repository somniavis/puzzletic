import type { CharacterEvolution, CharacterSpecies } from '../types/character';
import {
  CHARACTER_SPECIES_CORE,
  getEvolutionName,
  type CharacterSpeciesId,
} from './speciesCore';
import { CHARACTER_SPECIES_DETAILS } from './speciesDetails';

const mergeEvolutions = (
  speciesId: CharacterSpeciesId,
): CharacterEvolution[] => {
  const coreEvolutions = CHARACTER_SPECIES_CORE[speciesId].evolutions;
  const detailEvolutions = CHARACTER_SPECIES_DETAILS[speciesId].evolutions;

  return coreEvolutions.map((evolution, index) => ({
    ...evolution,
    ...detailEvolutions[index],
  }));
};

export const CHARACTER_SPECIES: Record<string, CharacterSpecies> = (
  Object.keys(CHARACTER_SPECIES_CORE) as CharacterSpeciesId[]
).reduce((accumulator, speciesId) => {
  accumulator[speciesId] = {
    ...CHARACTER_SPECIES_CORE[speciesId],
    ...CHARACTER_SPECIES_DETAILS[speciesId],
    evolutions: mergeEvolutions(speciesId),
  };

  return accumulator;
}, {} as Record<string, CharacterSpecies>);

export { getEvolutionName };
export type { CharacterSpeciesId };
