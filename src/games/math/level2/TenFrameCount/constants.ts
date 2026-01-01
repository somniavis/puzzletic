// Diverse Emoji Set (Animals, Nature, Food, Objects)
export const TEN_FRAME_COUNT_EMOJIS = [
    // Animals
    '🐱', '🐶', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐨', '🐯',
    '🦁', '🐮', '🐷', '🐸', '🐵', '🐔', '🐧', '🦆', '🦉', '🐝',
    '🦋', '🐌', '🐞', '🐢', '🐙', '🐠', '🐬', '🐳', '🦖', '🦄',

    // Nature & Plants
    '🌵', '🌲', '🌳', '🌴', '🍀', '🍁', '🍄', '🌷', '🌸', '🌹',
    '🌻', '🌼', '🌽', '🥕', '🍎', '🍊', '�', '🍉', '�🍇', '🍓',
    '🍒', '🍑', '🍍', '🥝', '🥥',

    // Food
    '🍞', '🥐', '🥨', '🥞', '🧀', '🍖', '🍔', '🍟', '🍕', '🌭',
    '🥪', '🌮', '🥗', '🍿', '🍙', '🍣', '🍤', '🍦', '🍩', '🍪',
    '🎂', '🍰', '🍫', '🍬', '🍭', '🍯', '🥛', '☕', '🧃',

    // Objects & Others
    '⚽', '🏀', '🏈', '⚾', '🎾', '🏐', '🎱', '🎈', '🎁', '🎀',
    '💎', '💍', '👑', '⭐', '🌟', '🔥', '💧', '�', '�', '�',
    '🤖', '🧸', '🧩', '🎨', '🥁', '�', '📚', '💡', '⏰', '🚗'
];

export const TEN_FRAME_COUNT_CONSTANTS = {
    GAME_ID: 'ten-frame-count',
    TIME_LIMIT: 60,
    BASE_LIVES: 3,
    // Difficulty Settings
    DIFFICULTY: {
        INTRO: { min: 10, max: 30 }, // First 3 rounds
        FULL: { min: 10, max: 99 }  // Rest of the game
    }
};
