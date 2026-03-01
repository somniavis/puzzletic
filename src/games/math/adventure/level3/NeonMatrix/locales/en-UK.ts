const manifest = {
    title: 'Neon Matrix',
    subtitle: 'Master 8s!',
    description: 'A speed puzzle to master the 8-times ending pattern.',
    powerups: {
        timeFreeze: 'Freeze',
        extraLife: 'Life',
        doubleScore: 'Double'
    },
    ui: {
        tapHint: 'Tap 8, 6, 4, 2, 0 to fill the blank.',
        dragDropHint: 'Tap 8, 6, 4, 2, 0 to fill the blank.',
        patternHint: 'Remember 8-6-4-2-0!',
        signTitle: '8 Times Secret Code',
        signCode: '8-6-4-2-0',
        cellLabel: '8x{{index}}',
        cellAriaLabel: 'Matrix cell {{index}}',
        modePattern: 'Pattern Lane',
        modeVertical: 'Vertical Match'
    },
    howToPlay: {
        step1: {
            title: '8-6-4-2-0!',
            description: 'Remember the pattern.'
        },
        step2: {
            title: 'Enter digits',
            description: 'Tap the right numbers.'
        },
        step3: {
            title: 'Set clear',
            description: 'Combo up!'
        }
    }
} as const;

export default manifest;
