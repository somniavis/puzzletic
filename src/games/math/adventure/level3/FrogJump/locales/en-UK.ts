const en = {
    title: 'Frog Jump',
    subtitle: 'Jump, jump, jump!',
    description: 'Pick the correct tick value and make the frog hop up.',
    powerups: {
        timeFreeze: 'Time Freeze',
        extraLife: 'Extra Life',
        doubleScore: 'Double Score',
    },
    ui: {
        jumpHint: 'How many jumps for the frog?'
    },
    howToPlay: {
        step1: {
            title: 'Check the marks!',
            description: 'Figure out the jump distance.'
        },
        step2: {
            title: 'Tap a number button',
            description: 'Find and choose the answer.'
        },
        step3: {
            title: 'Jump and land!',
            description: 'Reach the correct mark to clear it.'
        }
    }
} as const;

export default en;
