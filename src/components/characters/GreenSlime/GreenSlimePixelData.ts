import type { PixelColor } from '../../PixelArt/PixelRenderer';

const COLORS = {
  darkGreen: '#528049',
  green: '#85c57c',
  lightGreen: '#b7e2a3',
  highlight: '#FFFFFF',
  outline: '#2f482a',
  eye: '#2f482a',
  transparent: null,
};

const _ = COLORS.transparent;
const O = COLORS.outline;
const G = COLORS.green;
const L = COLORS.lightGreen;
const H = COLORS.highlight;
const E = COLORS.eye;
const D = COLORS.darkGreen;

// 24x24 pixel Green Slime (idle) - More accurate version
export const greenSlimeIdle: PixelColor[][] = [
  [_, _, _, _, _, _, _, O, O, O, O, O, O, O, O, O, O, _, _, _, _, _, _, _],
  [_, _, _, _, _, O, O, L, L, G, G, G, G, G, G, G, G, O, _, _, _, _, _, _],
  [_, _, _, _, O, L, L, H, H, L, G, G, G, G, G, G, G, G, O, _, _, _, _, _],
  [_, _, _, O, L, L, H, H, H, H, L, G, G, G, G, G, G, G, G, O, _, _, _, _],
  [_, _, O, L, L, H, H, H, H, L, G, G, G, G, G, G, G, G, G, G, O, _, _, _],
  [_, _, O, L, L, L, L, L, G, G, G, G, G, G, G, G, G, G, G, G, O, _, _, _],
  [_, O, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, O, _, _],
  [_, O, G, G, G, G, E, E, G, G, G, G, G, G, G, E, E, G, G, G, G, O, _, _],
  [O, G, G, G, G, G, E, E, G, G, G, G, G, G, G, E, E, G, G, G, G, G, O, _],
  [O, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, O, _],
  [O, G, D, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, D, O, _],
  [O, D, D, D, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, D, D, O, _],
  [O, D, D, D, D, D, G, G, G, G, G, G, G, G, G, G, G, G, D, D, D, D, O, _],
  [O, O, D, D, D, D, D, D, D, D, D, D, D, D, D, D, D, D, D, D, D, D, O, O],
  [_, O, O, O, O, O, O, O, O, O, O, O, O, O, O, O, O, O, O, O, O, O, O, _],
  [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
  [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
  [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
  [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
  [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
  [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
  [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
  [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
  [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
];

// Happy (with smile)
export const greenSlimeHappy: PixelColor[][] = [
  [_, _, _, _, _, _, _, O, O, O, O, O, O, O, O, O, O, _, _, _, _, _, _, _],
  [_, _, _, _, _, O, O, L, L, G, G, G, G, G, G, G, G, O, _, _, _, _, _, _],
  [_, _, _, _, O, L, L, H, H, L, G, G, G, G, G, G, G, G, O, _, _, _, _, _],
  [_, _, _, O, L, L, H, H, H, H, L, G, G, G, G, G, G, G, G, O, _, _, _, _],
  [_, _, O, L, L, H, H, H, H, L, G, G, G, G, G, G, G, G, G, G, O, _, _, _],
  [_, _, O, L, L, L, L, L, G, G, G, G, G, G, G, G, G, G, G, G, O, _, _, _],
  [_, O, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, O, _, _],
  [_, O, G, G, G, G, E, E, G, G, G, G, G, G, G, E, E, G, G, G, G, O, _, _],
  [O, G, G, G, G, G, E, E, G, G, G, G, G, G, G, E, E, G, G, G, G, G, O, _],
  [O, G, G, G, G, G, G, O, O, G, G, G, G, O, O, G, G, G, G, G, G, G, O, _],
  [O, G, D, G, G, G, O, D, D, O, G, G, O, D, D, O, G, G, G, G, G, D, O, _],
  [O, D, D, D, G, G, O, O, O, O, G, G, O, O, O, O, G, G, G, G, D, D, O, _],
  [O, D, D, D, D, D, G, G, G, G, G, G, G, G, G, G, G, G, D, D, D, D, O, _],
  [O, O, D, D, D, D, D, D, D, D, D, D, D, D, D, D, D, D, D, D, D, D, O, O],
  [_, O, O, O, O, O, O, O, O, O, O, O, O, O, O, O, O, O, O, O, O, O, O, _],
  [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
  [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
  [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
  [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
  [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
  [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
  [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
  [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
  [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
];

// Sleeping (closed eyes)
export const greenSlimeSleeping: PixelColor[][] = [
  [_, _, _, _, _, _, _, O, O, O, O, O, O, O, O, O, O, _, _, _, _, _, _, _],
  [_, _, _, _, _, O, O, L, L, G, G, G, G, G, G, G, G, O, _, _, _, _, _, _],
  [_, _, _, _, O, L, L, H, H, L, G, G, G, G, G, G, G, G, O, _, _, _, _, _],
  [_, _, _, O, L, L, H, H, H, H, L, G, G, G, G, G, G, G, G, O, _, _, _, _],
  [_, _, O, L, L, H, H, H, H, L, G, G, G, G, G, G, G, G, G, G, O, _, _, _],
  [_, _, O, L, L, L, L, L, G, G, G, G, G, G, G, G, G, G, G, G, O, _, _, _],
  [_, O, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, O, _, _],
  [_, O, G, G, G, G, _, _, G, G, G, G, G, G, G, _, _, G, G, G, G, O, _, _],
  [O, G, G, G, G, G, O, O, O, G, G, G, G, G, G, O, O, O, G, G, G, G, O, _],
  [O, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, O, _],
  [O, G, D, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, D, O, _],
  [O, D, D, D, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, D, D, O, _],
  [O, D, D, D, D, D, G, G, G, G, G, G, G, G, G, G, G, G, D, D, D, D, O, _],
  [O, O, D, D, D, D, D, D, D, D, D, D, D, D, D, D, D, D, D, D, D, D, O, O],
  [_, O, O, O, O, O, O, O, O, O, O, O, O, O, O, O, O, O, O, O, O, O, O, _],
  [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
  [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
  [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
  [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
  [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
  [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
  [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
  [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
  [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
];