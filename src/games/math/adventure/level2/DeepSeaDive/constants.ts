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

export const DIFFICULTY_CONFIG = {
    1: { min: 10, max: 30, borrowChance: 0.2 },
    2: { min: 30, max: 60, borrowChance: 0.5 },
    3: { min: 60, max: 99, borrowChance: 0.8 }
};

export const ANIMATION_TIMING = {
    DIVE_DURATION: 800, // Time for animal to reach depth
    RESET_DELAY: 1000,   // Delay before resetting position
    NEXT_PROBLEM_DELAY: 500 // Delay before generating next problem
};
