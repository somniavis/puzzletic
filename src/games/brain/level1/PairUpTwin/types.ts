
export type PairUpMode = 'twin' | 'connect';

export interface Card {
    id: string;        // Unique instance ID
    emoji: string;     // Display content
    pairId: string;    // ID used for matching (e.g. 'monkey' or 'rain_set')
    isFlipped: boolean;
    isMatched: boolean;
}

export interface PairData {
    pairId: string;
    items: [string, string]; // Two emojis that match
}

export interface LevelConfig {
    rows: number;
    cols: number;
    pairs: number;
    previewTime: number; // seconds
}
