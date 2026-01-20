import type { ComponentType, ReactNode, LazyExoticComponent } from 'react';

export type GameDifficulty = 1 | 2 | 3 | 4 | 5;
export type GameCategory = 'brain' | 'math' | 'science' | 'sw';

// Game component props
export interface GameComponentProps {
    onExit: () => void;
    gameId?: string;
}

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
    /** Game mode: 'adventure' (default) or 'genius' */
    mode?: 'adventure' | 'genius';
    /** URL to thumbnail image, emoji string, or React Node */
    thumbnail?: string | ReactNode;
    /** Key for localized title */
    titleKey?: string;
    /** Subtitle for the game */
    subtitle?: string;
    /** Key for localized subtitle */
    subtitleKey?: string;
    /** Key for localized description */
    descriptionKey?: string;
    /** The main component to render when the game is played (supports lazy loading) */
    component: ComponentType<GameComponentProps> | LazyExoticComponent<ComponentType<GameComponentProps>>;
}
