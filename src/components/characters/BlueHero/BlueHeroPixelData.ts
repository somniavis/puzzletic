import type { PixelColor } from '../../PixelArt/PixelRenderer';

const COLORS = {
  darkBlue: '#2B4C5E',
  mediumBlue: '#3D6B7D',
  lightBlue: '#5DA5B8',
  cyan: '#7FCDD9',
  skin: '#F5D4B0',
  darkSkin: '#D4A57A',
  orange: '#E89560',
  darkBrown: '#4D3A2C',
  mediumBrown: '#6B5445',
  lightBrown: '#8A6F5E',
  black: '#2D2D2D',
  transparent: null,
};

const _ = COLORS.transparent;
const DB = COLORS.darkBlue;
const MB = COLORS.mediumBlue;
const LB = COLORS.lightBlue;
const C = COLORS.cyan;
const S = COLORS.skin;
const DS = COLORS.darkSkin;
const O = COLORS.orange;
const DBR = COLORS.darkBrown;
const MBR = COLORS.mediumBrown;
const LBR = COLORS.lightBrown;
const E = COLORS.black;

// 24x24 pixel Blue Hero (idle) - Aesthetically improved version
export const blueHeroIdle: PixelColor[][] = [
  [_, _, _, _, _, _, _, _, _, _, O, O, _, _, _, _, _, _, _, _, _, _, _, _],
  [_, _, _, _, _, _, _, _, _, MB, C, C, LB, _, _, _, _, _, _, _, _, _, _, _],
  [_, _, _, _, _, _, _, _, MB, C, C, C, C, MB, _, _, _, _, _, _, _, _, _, _],
  [_, _, _, _, _, _, _, DB, C, C, C, C, C, C, DB, _, _, _, _, _, _, _, _, _],
  [_, _, _, _, _, _, DB, MB, LB, C, C, C, C, LB, MB, DB, _, _, _, _, _, _, _, _],
  [_, _, _, _, _, DB, S, S, S, S, S, S, S, S, S, S, DB, _, _, _, _, _, _, _],
  [_, _, _, _, DB, S, S, S, S, S, S, S, S, S, S, S, S, DB, _, _, _, _, _, _],
  [_, _, _, _, DB, S, E, E, S, S, S, S, S, S, S, E, E, S, DB, _, _, _, _, _],
  [_, _, _, DB, S, S, E, E, S, S, S, S, S, S, S, E, E, S, S, DB, _, _, _, _],
  [_, _, _, DB, S, S, S, S, S, DS, DS, DS, DS, S, S, S, S, S, DB, _, _, _, _, _],
  [_, _, _, DB, S, S, S, S, DS, DS, DS, DS, DS, DS, S, S, S, S, DB, _, _, _, _, _],
  [_, _, DB, DBR, DBR, DBR, DBR, DBR, DBR, DBR, DBR, DBR, DBR, DBR, DBR, DBR, DBR, DBR, DB, _, _, _, _, _],
  [_, _, DB, DBR, MBR, MBR, MBR, MBR, MBR, MBR, MBR, MBR, MBR, MBR, MBR, MBR, MBR, DBR, DB, _, _, _, _, _],
  [_, DB, DBR, MBR, LBR, LBR, LBR, LBR, LBR, LBR, LBR, LBR, LBR, LBR, LBR, LBR, LBR, MBR, DBR, DB, _, _, _, _],
  [_, DB, DBR, MBR, LBR, LBR, LBR, LBR, LBR, LBR, LBR, LBR, LBR, LBR, LBR, LBR, LBR, MBR, DBR, DB, _, _, _, _],
  [_, DB, DBR, MBR, LBR, LBR, LBR, LBR, O, O, LBR, LBR, LBR, LBR, LBR, LBR, LBR, MBR, DBR, DB, _, _, _, _],
  [_, DB, DBR, MBR, MBR, MBR, MBR, MBR, MBR, MBR, MBR, MBR, MBR, MBR, MBR, MBR, MBR, MBR, DBR, DB, _, _, _, _],
  [_, DB, DBR, DBR, DBR, DBR, DBR, DBR, DBR, DBR, DBR, DBR, DBR, DBR, DBR, DBR, DBR, DBR, DBR, DB, _, _, _, _],
  [_, _, _, DBR, DBR, DBR, DBR, _, _, _, _, _, _, _, _, _, _, DBR, DBR, DBR, DBR, _, _, _],
  [_, _, _, DBR, DBR, DBR, DBR, _, _, _, _, _, _, _, _, _, _, DBR, DBR, DBR, DBR, _, _, _],
  [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
  [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
  [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
  [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
];

// Happy - A subtle smile
export const blueHeroHappy: PixelColor[][] = [
  [_, _, _, _, _, _, _, _, _, _, O, O, _, _, _, _, _, _, _, _, _, _, _, _],
  [_, _, _, _, _, _, _, _, _, MB, C, C, LB, _, _, _, _, _, _, _, _, _, _, _],
  [_, _, _, _, _, _, _, _, MB, C, C, C, C, MB, _, _, _, _, _, _, _, _, _, _],
  [_, _, _, _, _, _, _, DB, C, C, C, C, C, C, DB, _, _, _, _, _, _, _, _, _],
  [_, _, _, _, _, _, DB, MB, LB, C, C, C, C, LB, MB, DB, _, _, _, _, _, _, _, _],
  [_, _, _, _, _, DB, S, S, S, S, S, S, S, S, S, S, DB, _, _, _, _, _, _, _],
  [_, _, _, _, DB, S, S, S, S, S, S, S, S, S, S, S, S, DB, _, _, _, _, _, _],
  [_, _, _, _, DB, S, E, E, S, S, S, S, S, S, S, E, E, S, DB, _, _, _, _, _],
  [_, _, _, DB, S, S, E, E, S, S, S, S, S, S, S, E, E, S, S, DB, _, _, _, _],
  [_, _, _, DB, S, S, S, S, S, _, _, _, _, S, S, S, S, S, DB, _, _, _, _, _],
  [_, _, _, DB, S, S, S, S, DS, DS, DS, DS, DS, DS, S, S, S, S, DB, _, _, _, _, _],
  [_, _, DB, DBR, DBR, DBR, S, DS, _, _, _, _, DS, S, DBR, DBR, DBR, DBR, DB, _, _, _, _, _],
  [_, _, DB, DBR, MBR, MBR, DBR, S, S, S, S, S, S, DBR, MBR, MBR, DBR, DB, _, _, _, _, _, _],
  [_, DB, DBR, MBR, LBR, MBR, DBR, DBR, DBR, DBR, DBR, DBR, DBR, DBR, MBR, LBR, MBR, DBR, DB, _, _, _, _, _],
  [_, DB, DBR, MBR, LBR, LBR, LBR, LBR, LBR, LBR, LBR, LBR, LBR, LBR, LBR, LBR, MBR, DBR, DB, _, _, _, _, _],
  [_, DB, DBR, MBR, LBR, LBR, LBR, LBR, O, O, LBR, LBR, LBR, LBR, LBR, LBR, MBR, DBR, DB, _, _, _, _, _],
  [_, DB, DBR, MBR, MBR, MBR, MBR, MBR, MBR, MBR, MBR, MBR, MBR, MBR, MBR, MBR, MBR, DBR, DB, _, _, _, _, _],
  [_, DB, DBR, DBR, DBR, DBR, DBR, DBR, DBR, DBR, DBR, DBR, DBR, DBR, DBR, DBR, DBR, DBR, DBR, DB, _, _, _, _],
  [_, _, _, DBR, DBR, DBR, DBR, _, _, _, _, _, _, _, _, _, _, DBR, DBR, DBR, DBR, _, _, _],
  [_, _, _, DBR, DBR, DBR, DBR, _, _, _, _, _, _, _, _, _, _, DBR, DBR, DBR, DBR, _, _, _],
  [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
  [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
  [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
  [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
];

// Sleeping
export const blueHeroSleeping: PixelColor[][] = [
  [_, _, _, _, _, _, _, _, _, _, O, O, _, _, _, _, _, _, _, _, _, _, _, _],
  [_, _, _, _, _, _, _, _, _, MB, C, C, LB, _, _, _, _, _, _, _, _, _, _, _],
  [_, _, _, _, _, _, _, _, MB, C, C, C, C, MB, _, _, _, _, _, _, _, _, _, _],
  [_, _, _, _, _, _, _, DB, C, C, C, C, C, C, DB, _, _, _, _, _, _, _, _, _],
  [_, _, _, _, _, _, DB, MB, LB, C, C, C, C, LB, MB, DB, _, _, _, _, _, _, _, _],
  [_, _, _, _, _, DB, S, S, S, S, S, S, S, S, S, S, DB, _, _, _, _, _, _, _],
  [_, _, _, _, DB, S, S, S, S, S, S, S, S, S, S, S, S, DB, _, _, _, _, _, _],
  [_, _, _, _, DB, S, _, _, _, S, S, S, S, S, S, _, _, _, S, DB, _, _, _, _],
  [_, _, _, DB, S, S, E, E, E, S, S, S, S, S, S, E, E, E, S, DB, _, _, _, _],
  [_, _, _, DB, S, S, S, S, S, DS, DS, DS, DS, S, S, S, S, S, DB, _, _, _, _, _],
  [_, _, _, DB, S, S, S, S, DS, DS, DS, DS, DS, DS, S, S, S, S, DB, _, _, _, _, _],
  [_, _, DB, DBR, DBR, DBR, DBR, DBR, DBR, DBR, DBR, DBR, DBR, DBR, DBR, DBR, DBR, DBR, DB, _, _, _, _, _],
  [_, _, DB, DBR, MBR, MBR, MBR, MBR, MBR, MBR, MBR, MBR, MBR, MBR, MBR, MBR, MBR, DBR, DB, _, _, _, _, _],
  [_, DB, DBR, MBR, LBR, LBR, LBR, LBR, LBR, LBR, LBR, LBR, LBR, LBR, LBR, LBR, LBR, MBR, DBR, DB, _, _, _, _],
  [_, DB, DBR, MBR, LBR, LBR, LBR, LBR, LBR, LBR, LBR, LBR, LBR, LBR, LBR, LBR, LBR, MBR, DBR, DB, _, _, _, _],
  [_, DB, DBR, MBR, LBR, LBR, LBR, LBR, O, O, LBR, LBR, LBR, LBR, LBR, LBR, LBR, MBR, DBR, DB, _, _, _, _],
  [_, DB, DBR, MBR, MBR, MBR, MBR, MBR, MBR, MBR, MBR, MBR, MBR, MBR, MBR, MBR, MBR, MBR, DBR, DB, _, _, _, _],
  [_, DB, DBR, DBR, DBR, DBR, DBR, DBR, DBR, DBR, DBR, DBR, DBR, DBR, DBR, DBR, DBR, DBR, DBR, DB, _, _, _, _],
  [_, _, _, DBR, DBR, DBR, DBR, _, _, _, _, _, _, _, _, _, _, DBR, DBR, DBR, DBR, _, _, _],
  [_, _, _, DBR, DBR, DBR, DBR, _, _, _, _, _, _, _, _, _, _, DBR, DBR, DBR, DBR, _, _, _],
  [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
  [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
  [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
  [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
];
