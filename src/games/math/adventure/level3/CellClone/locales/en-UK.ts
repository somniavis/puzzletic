const manifest = {
    title: 'Cell Clone',
    subtitle: 'Master 2s and 4s!',
    description: 'A multiplication game for the 2 and 4 times tables.',
    powerups: {
        timeFreeze: 'Freeze',
        extraLife: 'Life',
        doubleScore: 'Double'
    },
    ui: {
        dragDropHint: 'Drag & drop onto the cells'
    },
    howToPlay: {
        step1: {
            title: 'Count cells',
            description: 'Count the centre cells.'
        },
        step2: {
            title: 'Check target',
            description: 'Check the colour and number.'
        },
        step3: {
            title: 'Drag to clone',
            description: 'Drop the reagent and match it.'
        }
    }
} as const;

export default manifest;
