import { GreenSlime } from './GreenSlime/GreenSlime';
import { BlueHero } from './BlueHero/BlueHero';

export const CHARACTERS = {
  greenSlime: GreenSlime,
  blueHero: BlueHero,
} as const;

export type CharacterType = keyof typeof CHARACTERS;

export { GreenSlime, BlueHero };
