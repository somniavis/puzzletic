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
  CyanJello
};
