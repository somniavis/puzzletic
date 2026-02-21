export const GameIds = {
    // Math Level 1
    MATH_FISHING_COUNT: 'math-fishing-count',
    MATH_ROUND_COUNTING: 'math-round-counting',
    MATH_NUMBER_HIVE: 'math-number-hive',
    MATH_NUMBER_BALANCE: 'math-number-balance',
    MATH_JELLO_FEEDING: 'math-jello-feeding',
    MATH_FRUIT_SLICE: 'math-fruit-slice',
    MATH_ARCHERY: 'math-archery',
    MATH_ARCHERY_LV1: 'math-archery-lv1',
    MATH_COMPARE_CRITTERS: 'math-compare-critters',
    MATH_ARCHERY_LV2: 'math-archery-lv2',

    // Math Level 2
    TEN_FRAME_COUNT: 'ten-frame-count',
    PINWHEEL_POP: 'pinwheel-pop',
    DEEP_SEA_DIVE: 'deep-sea-dive', // Legacy?
    DEEP_SEA_DIVE_LV1: 'deep-sea-dive-lv1',
    DEEP_SEA_DIVE_LV2: 'deep-sea-dive-lv2',
    MATH_UFO_INVASION: 'math-level2-ufo-invasion',
    MATH_LOCK_OPENING: 'math-lock-opening',
    MATH_CARGO_TRAIN: 'math-cargo-train',
    MATH_ROCKET_LAUNCHER: 'math-rocket-launcher',
    SHAPE_SUM_LINK: 'shape-sum-link',
    MATH_FRUIT_BOX: 'math-fruit-box',
    MATH_ICE_STACKING: 'math-ice-stacking',
    MATH_FLOOR_TILER: 'math-floor-tiler',
    MATH_FROG_JUMP: 'math-frog-jump',
    MATH_BEGINNER_WIZARD: 'math-beginner-wizard',
    MATH_CONSTELLATION_FINDER: 'math-constellation-finder',
    MATH_TROLL_ATTACK: 'math-troll-attack',

    // Math Genius - Front Addition
    FRONT_ADDITION_LV1: 'front-addition-lv1',
    FRONT_ADDITION_LV2: 'front-addition-lv2',
    FRONT_ADDITION_LV3: 'front-addition-lv3',
    FRONT_ADDITION_LV4: 'front-addition-lv4',

    // Math Genius - Front Subtraction
    FRONT_SUBTRACTION_LV1: 'front-subtraction-lv1',
    FRONT_SUBTRACTION_LV2: 'front-subtraction-lv2',
    FRONT_SUBTRACTION_LV3: 'front-subtraction-lv3',
    FRONT_SUBTRACTION_LV4: 'front-subtraction-lv4',

    // Math Genius - Back Multiplication
    BACK_MULTIPLICATION_LV1: 'back-multiplication-lv1',
    BACK_MULTIPLICATION_LV2: 'back-multiplication-lv2',
    BACK_MULTIPLICATION_LV3: 'back-multiplication-lv3',
    BACK_MULTIPLICATION_LV4: 'back-multiplication-lv4',

    // Brain Level 1
    COLOR_LINK: 'color-link',
    PAIR_UP_TWIN: 'pair-up-twin',
    MAZE_ESCAPE: 'maze-escape',

    // Brain Level 2
    WILD_LINK: 'wild-link',
    ANIMAL_BANQUET: 'animal-banquet',
    PAIR_UP_CONNECT: 'pair-up-connect',
    MAZE_HUNTER: 'maze-hunter',
    SIGNAL_HUNTER: 'signal-hunter',
    BRAIN_BLOCK_TOWER: 'brain-block-tower',

    // Brain Level 3
    TIC_TAC_TOE: 'tic-tac-toe',
    BRAIN_OMOK: 'brain-omok',
} as const;

export type GameId = typeof GameIds[keyof typeof GameIds];
