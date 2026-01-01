export const PINWHEEL_POP_CONSTANTS = {
    GAME_ID: 'pinwheel-pop',
    TIME_LIMIT: 60,
    BASE_LIVES: 3,
    STAGES_PER_ROUND: 4, // 4 wings per pinwheel
    DIFFICULTY_CONFIG: {
        1: { type: 'tens_ones_add', range: [10, 90] },
        2: { type: 'tens_tens_add', range: [10, 90] },
        3: { type: 'tens_tens_add', range: [10, 90] }, // Cap at tens_tens_add for now
        4: { type: 'tens_tens_add', range: [10, 99] }
    }
} as const;
