export default {
    title: 'Beginner Wizard',
    subtitle: 'Cast the 0 or 1 spell!',
    description: 'Choose protect/remove magic to match the target.',
    ui: {
        targetLabel: 'Target',
        protectHint: '🛡️ keep all',
        removeHint: '🕳️ vanish all',
        tapSpellHint: 'Tap the spell!'
    },
    howToPlay: {
        step1: {
            title: 'Two spells',
            description: 'Practice both spells.'
        },
        step2: {
            title: 'x1: Protect spell',
            description: 'Keeps the animals as they are.'
        },
        step3: {
            title: 'x0: Remove spell',
            description: 'Sends the animals into the black hole.'
        }
    }
} as const;
