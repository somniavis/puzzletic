const en = {
    title: 'Fair Share',
    subtitle: 'Share the Same Number!',
    description: 'A multiplication game for the 2 and 4 times tables.',
    powerups: {
        timeFreeze: 'Freeze',
        extraLife: 'Life',
        doubleScore: 'Double'
    },
    ui: {
        dragDropHint: 'Drag and drop into the baskets!',
        mission: 'Share equally with {{count}} friends.'
    },
    howToPlay: {
        step1: {
            title: 'Count Your Friends',
            description: 'Count how many friends there are.'
        },
        step2: {
            title: 'Drag the Fruits',
            description: 'Drag fruits into the baskets.'
        },
        step3: {
            title: 'Make It Fair',
            description: 'Match all basket counts to win!'
        }
    }
} as const;

export default en;
