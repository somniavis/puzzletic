/**
 * Character Components
 * 모든 젤로 캐릭터 컴포넌트를 export합니다.
 */

// Import from base (Stage 1)
import {
  YellowJello,
  RedJello,
  LimeJello,
  MintJello,
  BlueJello,
  CreamJello,
  PurpleJello,
  SkyJello,
  BrownJello,
  OrangeJello,
  OliveJello,
  CyanJello,
} from './base';

// Import from evolved (Stage 2+)
import {
  YellowPearJello,
  RedDevilJello,
  LimeLeafJello,
  MintSproutJello,
  BlueCatJello,
  CreamRamJello,
  PurpleImpJello,
  SkyLynxJello,
  BrownWillowJello,
  OrangeTailJello,
  OliveBloomJello,
  CyanGhostJello,
} from './evolved';

// Export metadata and utilities
export * from './metadata';

// Export all characters object
export const CHARACTERS = {
  yellowJello: YellowJello,
  redJello: RedJello,
  limeJello: LimeJello,
  mintJello: MintJello,
  blueJello: BlueJello,
  creamJello: CreamJello,
  purpleJello: PurpleJello,
  skyJello: SkyJello,
  brownJello: BrownJello,
  orangeJello: OrangeJello,
  oliveJello: OliveJello,
  cyanJello: CyanJello,
  yellowPearJello: YellowPearJello,
  redDevilJello: RedDevilJello,
  limeLeafJello: LimeLeafJello,
  mintSproutJello: MintSproutJello,
  blueCatJello: BlueCatJello,
  creamRamJello: CreamRamJello,
  purpleImpJello: PurpleImpJello,
  skyLynxJello: SkyLynxJello,
  brownWillowJello: BrownWillowJello,
  orangeTailJello: OrangeTailJello,
  oliveBloomJello: OliveBloomJello,
  cyanGhostJello: CyanGhostJello,
} as const;

export type CharacterType = keyof typeof CHARACTERS;

// Export individual characters
export {
  // Base characters (Stage 1)
  YellowJello,
  RedJello,
  LimeJello,
  MintJello,
  BlueJello,
  CreamJello,
  PurpleJello,
  SkyJello,
  BrownJello,
  OrangeJello,
  OliveJello,
  CyanJello,
  // Evolved characters (Stage 2)
  YellowPearJello,
  RedDevilJello,
  LimeLeafJello,
  MintSproutJello,
  BlueCatJello,
  CreamRamJello,
  PurpleImpJello,
  SkyLynxJello,
  BrownWillowJello,
  OrangeTailJello,
  OliveBloomJello,
  CyanGhostJello,
};
