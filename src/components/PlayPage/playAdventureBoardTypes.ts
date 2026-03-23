import type { GameManifest } from '../../games/types';

export interface PlayAdventureBoardGame {
    game: GameManifest;
    unlocked: boolean;
    isPremiumLocked: boolean;
    displayReason?: string;
    clearCount: number;
    isMastered: boolean;
}

export type PlayAdventureBoardTheme = 'math' | 'brain';

export type BoardTileKind = 'path' | 'forest';

export interface BoardTile {
    x: number;
    y: number;
    kind: BoardTileKind;
}

export interface BoardSlot {
    x: number;
    y: number;
}

export interface BoardLayout {
    boardRows: number;
    tiles: BoardTile[];
    padSlots: BoardSlot[];
    hasStartPad: boolean;
    rowOffset: number;
}

export interface BoardLevelViewModel {
    level: number;
    games: PlayAdventureBoardGame[];
    layout: BoardLayout;
    accessibleBundleIndexes: Set<number>;
}

export interface BoardLevelRenderModel extends BoardLevelViewModel {
    currentJelloGame: PlayAdventureBoardGame | null;
    currentJelloSlot: { x: number; y: number } | null;
    currentFreeRoamTile: { level: number; x: number; y: number } | null;
}

export type ForestClusterVariant =
    | 'island'
    | 'beach'
    | 'desert-oasis'
    | 'fish'
    | 'jellyfish'
    | 'whale'
    | 'pufferfish'
    | 'trees'
    | 'pines'
    | 'sunflowers'
    | 'tulips'
    | 'mushrooms'
    | 'woodpile'
    | 'desert-sprouts'
    | 'cacti'
    | 'rocks'
    | 'scorpions'
    | 'beetles';

export interface CreatureMotionPreset {
    animationName: string;
    delay: string;
    duration: string;
}

export interface CreatureFacingPreset {
    scaleX: string;
    angle: string;
}

export interface CreatureMotionAssignment extends CreatureMotionPreset, CreatureFacingPreset {}

export interface BoatMotionAssignment {
    tileKey: string;
    animationName: string;
    delay: string;
    duration: string;
}

export type BrainPulseDirection =
    | 'horizontal-right'
    | 'horizontal-left'
    | 'vertical-down'
    | 'vertical-up';

export interface BrainPulseDecoration {
    className: BrainPulseDirection;
    top: string;
    left: string;
    duration: string;
    delay: string;
}

export type OverlayMotionKey = 'boat' | 'sailboat' | 'camel' | 'bee' | 'elephant';

export interface OverlayTilePositionRule {
    x: number;
    bundleLocalY: number;
}

export interface OverlayTileRule {
    motionKey: OverlayMotionKey;
    level: number;
    bundleIndex: number;
    positions: OverlayTilePositionRule[];
}
