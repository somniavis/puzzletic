export const GAME_ID = 'deep-sea-subtraction';

export const ANIMALS = [
    '🐋', // Whale
    '🐬', // Dolphin
    '🦭', // Seal
    '🐟', // Fish
    '🐠', // Tropical Fish
    '🐡', // Pufferfish
    '🦈', // Shark
    '🐙', // Octopus
    '🦑', // Squid
    '🪼'  // Jellyfish
];


export const LEVEL_CONFIGS = {
    1: { min: 2, max: 20, borrowChance: 0.2, description: "Subtraction within 20" },
    2: { min: 10, max: 100, borrowChance: 0.5, description: "Subtraction within 100" }
};


export const ANIMATION_TIMING = {
    DIVE_DURATION: 800, // Time for animal to reach depth
    RESET_DELAY: 1000,   // Delay before resetting position
    NEXT_PROBLEM_DELAY: 500 // Delay before generating next problem
};
