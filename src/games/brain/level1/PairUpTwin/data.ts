import type { PairData } from './types';

// --- Twin Data (Identical Pairs) ---
// We just need a list of single emojis. Reference WildLink mammals/etc.
export const TWIN_EMOJIS = [
    '🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐨', '🐯',
    '🦁', '🐮', '🐷', '🐸', '🐵', '🐔', '🐧', '🐦', '🦆', '🦅',
    '🍎', '🍐', '🍊', '🍋', '🍌', '🍉', '🍇', '🍓', '🫐', '🍈',
    '🚗', '🚕', '🚙', '🚌', '🏎️', '🚓', '🚑', '🚒', '🚜', '🚚',
    '⚽', '🏀', '🏈', '⚾', '🥎', '🎾', '🏐', '🏉', '🎱', '🏓'
];

// --- Connect Data (Logical Pairs) ---
// Based on the user-approved list
export const CONNECT_PAIRS: PairData[] = [
    // Animals & Food
    { pairId: 'monkey_banana', items: ['🐵', '🍌'] },
    { pairId: 'rabbit_carrot', items: ['🐰', '🥕'] },
    { pairId: 'panda_bamboo', items: ['🐼', '🎋'] },
    { pairId: 'mouse_cheese', items: ['🐭', '🧀'] },
    { pairId: 'dog_bone', items: ['🐶', '🦴'] },
    { pairId: 'bear_honey', items: ['🐻', '🍯'] },

    // Weather & Items
    { pairId: 'rain_umbrella', items: ['🌧️', '☔'] },
    { pairId: 'snowman_snow', items: ['⛄', '❄️'] },
    { pairId: 'sun_sunglasses', items: ['☀️', '😎'] },

    // Jobs & Tools
    { pairId: 'doctor_hospital', items: ['👨‍⚕️', '🏥'] },
    { pairId: 'chef_pan', items: ['👨‍🍳', '🍳'] },
    { pairId: 'police_car', items: ['👮', '🚓'] },
    { pairId: 'firefighter_truck', items: ['👨‍🚒', '🚒'] },
    { pairId: 'farmer_rice', items: ['👨‍🌾', '🌾'] },
    { pairId: 'astronaut_rocket', items: ['👨‍🚀', '🚀'] },


    // Objects
    { pairId: 'letter_mailbox', items: ['✉️', '📮'] },
    { pairId: 'key_lock', items: ['🔑', '🔒'] },

    { pairId: 'brush_palette', items: ['🖌️', '🎨'] },

];
