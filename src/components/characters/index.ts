import { YellowJello } from './YellowJello/YellowJello';
import { RedJello } from './RedJello/RedJello';
import { LimeJello } from './LimeJello/LimeJello';
import { MintJello } from './MintJello/MintJello';
import { BlueJello } from './BlueJello/BlueJello';
import { CreamJello } from './CreamJello/CreamJello';
import { PurpleJello } from './PurpleJello/PurpleJello';
import { SkyJello } from './SkyJello/SkyJello';
import { BrownJello } from './BrownJello/BrownJello';
import { OrangeJello } from './OrangeJello/OrangeJello';
import { OliveJello } from './OliveJello/OliveJello';
import { CyanJello } from './CyanJello/CyanJello';
import { YellowPearJello } from './YellowPearJello/YellowPearJello';
import { RedDevilJello } from './RedDevilJello/RedDevilJello';
import { LimeLeafJello } from './LimeLeafJello/LimeLeafJello';
import { MintSproutJello } from './MintSproutJello/MintSproutJello';
import { BlueCatJello } from './BlueCatJello/BlueCatJello';
import { CreamRamJello } from './CreamRamJello/CreamRamJello';
import { PurpleImpJello } from './PurpleImpJello/PurpleImpJello';
import { SkyLynxJello } from './SkyLynxJello/SkyLynxJello';
import { BrownWillowJello } from './BrownWillowJello/BrownWillowJello';
import { OrangeTailJello } from './OrangeTailJello/OrangeTailJello';
import { OliveBloomJello } from './OliveBloomJello/OliveBloomJello';
import { CyanGhostJello } from './CyanGhostJello/CyanGhostJello';

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

export {
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
  CyanGhostJello
};
