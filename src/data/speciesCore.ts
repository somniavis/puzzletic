import type { CharacterEvolutionCore, CharacterSpeciesCore, EvolutionStage } from '../types/character';

const CHARACTER_SPECIES_CORE_DATA = {
  yellowJello: {
    id: 'yellowJello',
    name: 'Yellow Jello',
    personality: 'affectionate',
    evolutions: [
      { stage: 1, name: 'Yellow Jello', imageUrl: 'https://pub-1411335941ed4406b5f667f40e04a814.r2.dev/jello_img/jello-yello-1.png' },
      { stage: 2, name: 'Twiglo', imageUrl: 'https://pub-1411335941ed4406b5f667f40e04a814.r2.dev/jello_img/jello-yello-2.png' },
      { stage: 3, name: 'Vinegel', imageUrl: 'https://pub-1411335941ed4406b5f667f40e04a814.r2.dev/jello_img/jello-yello-3.png' },
      { stage: 4, name: 'Honeybloom', imageUrl: 'https://pub-1411335941ed4406b5f667f40e04a814.r2.dev/jello_img/jello-yello-4L.png' },
      { stage: 5, name: 'Arboros', imageUrl: 'https://pub-1411335941ed4406b5f667f40e04a814.r2.dev/jello_img/jello-yello-5L.png' },
    ],
  },
  redJello: {
    id: 'redJello',
    name: 'Red Jello',
    personality: 'playful',
    evolutions: [
      { stage: 1, name: 'Red Jello', imageUrl: 'https://pub-1411335941ed4406b5f667f40e04a814.r2.dev/jello_img/jello-red-1.png' },
      { stage: 2, name: 'Devilet', imageUrl: 'https://pub-1411335941ed4406b5f667f40e04a814.r2.dev/jello_img/jello-red-2.png' },
      { stage: 3, name: 'Impgel', imageUrl: 'https://pub-1411335941ed4406b5f667f40e04a814.r2.dev/jello_img/jello-red-3.png' },
      { stage: 4, name: 'Pyron', imageUrl: 'https://pub-1411335941ed4406b5f667f40e04a814.r2.dev/jello_img/jello-red-4L.png' },
      { stage: 5, name: 'Infernos', imageUrl: 'https://pub-1411335941ed4406b5f667f40e04a814.r2.dev/jello_img/jello-red-5L.png' },
    ],
  },
  mintJello: {
    id: 'mintJello',
    name: 'Mint Jello',
    personality: 'calm',
    evolutions: [
      { stage: 1, name: 'Mint Jello', imageUrl: 'https://pub-1411335941ed4406b5f667f40e04a814.r2.dev/jello_img/jello-mint-1.png' },
      { stage: 2, name: 'Leaflo', imageUrl: 'https://pub-1411335941ed4406b5f667f40e04a814.r2.dev/jello_img/jello-mint-2.png' },
      { stage: 3, name: 'Bloomint', imageUrl: 'https://pub-1411335941ed4406b5f667f40e04a814.r2.dev/jello_img/jello-mint-3.png' },
      { stage: 4, name: 'Fairyleaf', imageUrl: 'https://pub-1411335941ed4406b5f667f40e04a814.r2.dev/jello_img/jello-mint-4L.png' },
      { stage: 5, name: 'Verdantos', imageUrl: 'https://pub-1411335941ed4406b5f667f40e04a814.r2.dev/jello_img/jello-mint-5L.png' },
    ],
  },
  blueJello: {
    id: 'blueJello',
    name: 'Blue Jello',
    personality: 'shy',
    evolutions: [
      { stage: 1, name: 'Blue Jello', imageUrl: 'https://pub-1411335941ed4406b5f667f40e04a814.r2.dev/jello_img/jello-blue-1.png' },
      { stage: 2, name: 'Fingel', imageUrl: 'https://pub-1411335941ed4406b5f667f40e04a814.r2.dev/jello_img/jello-blue-2.png' },
      { stage: 3, name: 'Coralin', imageUrl: 'https://pub-1411335941ed4406b5f667f40e04a814.r2.dev/jello_img/jello-blue-3.png' },
      { stage: 4, name: 'Hydro', imageUrl: 'https://pub-1411335941ed4406b5f667f40e04a814.r2.dev/jello_img/jello-blue-4L.png' },
      { stage: 5, name: 'Oceanos', imageUrl: 'https://pub-1411335941ed4406b5f667f40e04a814.r2.dev/jello_img/jello-blue-5L.png' },
    ],
  },
  purpleJello: {
    id: 'purpleJello',
    name: 'Purple Jello',
    personality: 'grumpy',
    evolutions: [
      { stage: 1, name: 'Purple Jello', imageUrl: 'https://pub-1411335941ed4406b5f667f40e04a814.r2.dev/jello_img/jello-purple-1.png' },
      { stage: 2, name: 'Wisper', imageUrl: 'https://pub-1411335941ed4406b5f667f40e04a814.r2.dev/jello_img/jello-purple-2.png' },
      { stage: 3, name: 'Runeimp', imageUrl: 'https://pub-1411335941ed4406b5f667f40e04a814.r2.dev/jello_img/jello-purple-3.png' },
      { stage: 4, name: 'Spellbound', imageUrl: 'https://pub-1411335941ed4406b5f667f40e04a814.r2.dev/jello_img/jello-purple-4L.png' },
      { stage: 5, name: 'Arcanios', imageUrl: 'https://pub-1411335941ed4406b5f667f40e04a814.r2.dev/jello_img/jello-purple-5L.png' },
    ],
  },
  orangeJello: {
    id: 'orangeJello',
    name: 'Orange Jello',
    personality: 'energetic',
    evolutions: [
      { stage: 1, name: 'Orange Jello', imageUrl: 'https://pub-1411335941ed4406b5f667f40e04a814.r2.dev/jello_img/jello-orange-1.png' },
      { stage: 2, name: 'Mandapop', imageUrl: 'https://pub-1411335941ed4406b5f667f40e04a814.r2.dev/jello_img/jello-orange-2.png' },
      { stage: 3, name: 'Citrupix', imageUrl: 'https://pub-1411335941ed4406b5f667f40e04a814.r2.dev/jello_img/jello-orange-3.png' },
      { stage: 4, name: 'Vitawing', imageUrl: 'https://pub-1411335941ed4406b5f667f40e04a814.r2.dev/jello_img/jello-orange-4L.png' },
      { stage: 5, name: 'Tangeros', imageUrl: 'https://pub-1411335941ed4406b5f667f40e04a814.r2.dev/jello_img/jello-orange-5L.png' },
    ],
  },
  creamJello: {
    id: 'creamJello',
    name: 'Cream Jello',
    personality: 'calm',
    evolutions: [
      { stage: 1, name: 'Cream Jello', imageUrl: 'https://pub-1411335941ed4406b5f667f40e04a814.r2.dev/jello_img/jello-cream-1.png' },
      { stage: 2, name: 'Mewlo', imageUrl: 'https://pub-1411335941ed4406b5f667f40e04a814.r2.dev/jello_img/jello-cream-2.png' },
      { stage: 3, name: 'Whiskel', imageUrl: 'https://pub-1411335941ed4406b5f667f40e04a814.r2.dev/jello_img/jello-cream-3.png' },
      { stage: 4, name: 'Keepurr', imageUrl: 'https://pub-1411335941ed4406b5f667f40e04a814.r2.dev/jello_img/jello-cream-4L.png' },
      { stage: 5, name: 'Felinos', imageUrl: 'https://pub-1411335941ed4406b5f667f40e04a814.r2.dev/jello_img/jello-cream-5L.png' },
    ],
  },
  pinkJello: {
    id: 'pinkJello',
    name: 'Pink Jello',
    personality: 'affectionate',
    evolutions: [
      { stage: 1, name: 'Pink Jello', imageUrl: 'https://pub-1411335941ed4406b5f667f40e04a814.r2.dev/jello_img/jello-pink-1.png' },
      { stage: 2, name: 'Lolligel', imageUrl: 'https://pub-1411335941ed4406b5f667f40e04a814.r2.dev/jello_img/jello-pink-2.png' },
      { stage: 3, name: 'Twingel', imageUrl: 'https://pub-1411335941ed4406b5f667f40e04a814.r2.dev/jello_img/jello-pink-3.png' },
      { stage: 4, name: 'Cottonpuff', imageUrl: 'https://pub-1411335941ed4406b5f667f40e04a814.r2.dev/jello_img/jello-pink-4L.png' },
      { stage: 5, name: 'Candios', imageUrl: 'https://pub-1411335941ed4406b5f667f40e04a814.r2.dev/jello_img/jello-pink-5L.png' },
    ],
  },
} satisfies Record<string, CharacterSpeciesCore>;

export type CharacterSpeciesId = keyof typeof CHARACTER_SPECIES_CORE_DATA;

export const CHARACTER_SPECIES_CORE: Record<string, CharacterSpeciesCore> = CHARACTER_SPECIES_CORE_DATA;

export function getEvolutionName(speciesId: string, stage: EvolutionStage): string {
  const species = CHARACTER_SPECIES_CORE[speciesId];
  if (!species) {
    return 'Unknown';
  }
  const evolution = species.evolutions.find((item: CharacterEvolutionCore) => item.stage === stage);
  return evolution?.name || species.name;
}
