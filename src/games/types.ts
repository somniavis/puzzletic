import type { ComponentType } from 'react';

export type GameDifficulty = 1 | 2 | 3 | 4 | 5;
export type GameCategory = 'math' | 'science' | 'sw';

export interface GameManifest {
    /** Unique identifier for the game (e.g., 'math-level1-simple') */
    id: string;
    /** Display title of the game */
    title: string;
    /** Brief description shown in the game card */
    description: string;
    /** Game category */
    category: GameCategory;
    /** Difficulty level (1-5) */
    level: GameDifficulty;
    /** URL to thumbnail image or emoji as placeholder */
    thumbnail?: string;
    /** Key for localized title */
    titleKey?: string;
    /** Subtitle for the game */
    subtitle?: string;
    /** Key for localized subtitle */
    subtitleKey?: string;
    /** Key for localized description */
    descriptionKey?: string;
    /** The main component to render when the game is played */
    component: ComponentType<{ onExit: () => void }>;
}
