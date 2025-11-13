import type { CharacterSpecies, EvolutionStage } from '../types/character';

export const CHARACTER_SPECIES: Record<string, CharacterSpecies> = {
  yellowJello: {
    id: 'yellowJello',
    name: 'Yellow Jello',
    description: 'A sweet and adorable jello with a sunny glow.',
    evolutions: [
      {
        stage: 1,
        name: 'Yellow Jello',
        requiredLevel: 1,
        requiredAffection: 0,
        description: 'A tiny yellow jello, soft and squishy.',
      },
      {
        stage: 2,
        name: 'Yellow Pear Jello',
        requiredLevel: 10,
        requiredAffection: 50,
        description: 'A pear-shaped yellow jello with evolved features.',
      },
      {
        stage: 3,
        name: 'Sunlight Jello',
        requiredLevel: 25,
        requiredAffection: 80,
        description: 'A radiant yellow jello that glows brilliantly.',
      },
    ],
  },
  redJello: {
    id: 'redJello',
    name: 'Red Jello',
    description: 'A vibrant red jello full of energy.',
    evolutions: [
      {
        stage: 1,
        name: 'Red Jello',
        requiredLevel: 1,
        requiredAffection: 0,
        description: 'A tiny red jello, bouncy and bright.',
      },
      {
        stage: 2,
        name: 'Red Devil Jello',
        requiredLevel: 10,
        requiredAffection: 50,
        description: 'A devilish red jello with horn-like features.',
      },
      {
        stage: 3,
        name: 'Crimson Jello',
        requiredLevel: 25,
        requiredAffection: 80,
        description: 'A deep crimson jello radiating power.',
      },
    ],
  },
  limeJello: {
    id: 'limeJello',
    name: 'Lime Jello',
    description: 'A fresh lime jello with zesty personality.',
    evolutions: [
      {
        stage: 1,
        name: 'Lime Jello',
        requiredLevel: 1,
        requiredAffection: 0,
        description: 'A tiny lime jello, fresh and zesty.',
      },
      {
        stage: 2,
        name: 'Lime Leaf Jello',
        requiredLevel: 10,
        requiredAffection: 50,
        description: 'A lime jello with leaf-like decorations.',
      },
      {
        stage: 3,
        name: 'Jade Jello',
        requiredLevel: 25,
        requiredAffection: 80,
        description: 'A precious jade jello gleaming brightly.',
      },
    ],
  },
  mintJello: {
    id: 'mintJello',
    name: 'Mint Jello',
    description: 'A cool mint jello with refreshing charm.',
    evolutions: [
      {
        stage: 1,
        name: 'Mint Jello',
        requiredLevel: 1,
        requiredAffection: 0,
        description: 'A tiny mint jello, cool and refreshing.',
      },
      {
        stage: 2,
        name: 'Mint Sprout Jello',
        requiredLevel: 10,
        requiredAffection: 50,
        description: 'A mint jello with sprout-like features.',
      },
      {
        stage: 3,
        name: 'Arctic Jello',
        requiredLevel: 25,
        requiredAffection: 80,
        description: 'A frosty arctic jello with icy beauty.',
      },
    ],
  },
  blueJello: {
    id: 'blueJello',
    name: 'Blue Jello',
    description: 'A calm blue jello like the deep ocean.',
    evolutions: [
      {
        stage: 1,
        name: 'Blue Jello',
        requiredLevel: 1,
        requiredAffection: 0,
        description: 'A tiny blue jello, calm and serene.',
      },
      {
        stage: 2,
        name: 'Blue Cat Jello',
        requiredLevel: 10,
        requiredAffection: 50,
        description: 'A blue jello with cat-like ears and features.',
      },
      {
        stage: 3,
        name: 'Ocean Jello',
        requiredLevel: 25,
        requiredAffection: 80,
        description: 'A majestic ocean jello with deep wisdom.',
      },
    ],
  },
  creamJello: {
    id: 'creamJello',
    name: 'Cream Jello',
    description: 'A soft cream jello with gentle nature.',
    evolutions: [
      {
        stage: 1,
        name: 'Cream Jello',
        requiredLevel: 1,
        requiredAffection: 0,
        description: 'A tiny cream jello, soft and gentle.',
      },
      {
        stage: 2,
        name: 'Cream Ram Jello',
        requiredLevel: 10,
        requiredAffection: 50,
        description: 'A cream jello with ram-like horns.',
      },
      {
        stage: 3,
        name: 'Pearl Jello',
        requiredLevel: 25,
        requiredAffection: 80,
        description: 'A lustrous pearl jello shining softly.',
      },
    ],
  },
  purpleJello: {
    id: 'purpleJello',
    name: 'Purple Jello',
    description: 'A royal purple jello with mystical aura.',
    evolutions: [
      {
        stage: 1,
        name: 'Purple Jello',
        requiredLevel: 1,
        requiredAffection: 0,
        description: 'A tiny purple jello, mysterious and charming.',
      },
      {
        stage: 2,
        name: 'Purple Imp Jello',
        requiredLevel: 10,
        requiredAffection: 50,
        description: 'A purple jello with imp-like features.',
      },
      {
        stage: 3,
        name: 'Royal Jello',
        requiredLevel: 25,
        requiredAffection: 80,
        description: 'A regal purple jello fit for royalty.',
      },
    ],
  },
  skyJello: {
    id: 'skyJello',
    name: 'Sky Jello',
    description: 'A bright sky jello as clear as daylight.',
    evolutions: [
      {
        stage: 1,
        name: 'Sky Jello',
        requiredLevel: 1,
        requiredAffection: 0,
        description: 'A tiny sky jello, bright and cheerful.',
      },
      {
        stage: 2,
        name: 'Sky Lynx Jello',
        requiredLevel: 10,
        requiredAffection: 50,
        description: 'A sky jello with lynx-like features.',
      },
      {
        stage: 3,
        name: 'Heaven Jello',
        requiredLevel: 25,
        requiredAffection: 80,
        description: 'A heavenly jello floating gracefully.',
      },
    ],
  },
  brownJello: {
    id: 'brownJello',
    name: 'Brown Jello',
    description: 'A warm brown jello with earthy charm.',
    evolutions: [
      {
        stage: 1,
        name: 'Brown Jello',
        requiredLevel: 1,
        requiredAffection: 0,
        description: 'A tiny brown jello, warm and cozy.',
      },
      {
        stage: 2,
        name: 'Brown Willow Jello',
        requiredLevel: 10,
        requiredAffection: 50,
        description: 'A brown jello with willow-like branches.',
      },
      {
        stage: 3,
        name: 'Chocolate Jello',
        requiredLevel: 25,
        requiredAffection: 80,
        description: 'A delicious chocolate jello full of sweetness.',
      },
    ],
  },
  orangeJello: {
    id: 'orangeJello',
    name: 'Orange Jello',
    description: 'A cheerful orange jello bursting with joy.',
    evolutions: [
      {
        stage: 1,
        name: 'Orange Jello',
        requiredLevel: 1,
        requiredAffection: 0,
        description: 'A tiny orange jello, bright and cheerful.',
      },
      {
        stage: 2,
        name: 'Orange Tail Jello',
        requiredLevel: 10,
        requiredAffection: 50,
        description: 'An orange jello with a fox-like tail.',
      },
      {
        stage: 3,
        name: 'Sunset Jello',
        requiredLevel: 25,
        requiredAffection: 80,
        description: 'A glowing sunset jello radiating warmth.',
      },
    ],
  },
  oliveJello: {
    id: 'oliveJello',
    name: 'Olive Jello',
    description: 'A unique olive jello with natural grace.',
    evolutions: [
      {
        stage: 1,
        name: 'Olive Jello',
        requiredLevel: 1,
        requiredAffection: 0,
        description: 'A tiny olive jello, earthy and unique.',
      },
      {
        stage: 2,
        name: 'Olive Bloom Jello',
        requiredLevel: 10,
        requiredAffection: 50,
        description: 'An olive jello with blooming flowers.',
      },
      {
        stage: 3,
        name: 'Forest Jello',
        requiredLevel: 25,
        requiredAffection: 80,
        description: 'A deep forest jello connected to nature.',
      },
    ],
  },
  cyanJello: {
    id: 'cyanJello',
    name: 'Cyan Jello',
    description: 'A bright cyan jello sparkling like water.',
    evolutions: [
      {
        stage: 1,
        name: 'Cyan Jello',
        requiredLevel: 1,
        requiredAffection: 0,
        description: 'A tiny cyan jello, sparkling and clear.',
      },
      {
        stage: 2,
        name: 'Cyan Ghost Jello',
        requiredLevel: 10,
        requiredAffection: 50,
        description: 'A cyan jello with ghost-like features.',
      },
      {
        stage: 3,
        name: 'Crystal Jello',
        requiredLevel: 25,
        requiredAffection: 80,
        description: 'A crystalline cyan jello gleaming brilliantly.',
      },
    ],
  },
};

// Export type for species IDs
export type CharacterSpeciesId = keyof typeof CHARACTER_SPECIES;

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
