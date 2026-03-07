const manifest = {
    title: 'Magic Potion',
    'title-lv1': 'Magic Potion (Lv1)',
    'title-lv2': 'Magic Potion (Lv2)',
    subtitle: 'Mix Magic Ingredients!',
    description: 'ㅇㅇㅇ',
    ui: {
        placeholder: 'ㅇㅇㅇ',
        makeLabel: 'MAKE',
        dragHint: 'Drag and drop 3 ingredients!',
        correct: 'CORRECT!',
        wrong: 'MISS!',
    },
    powerups: {
        timeFreeze: 'Time Freeze',
        extraLife: 'Extra Life',
        doubleScore: 'Double Score',
    },
    howToPlay: {
        step1: {
            title: 'Check the Target',
            description: 'Look at the target number first.',
        },
        step2: {
            title: 'Pick 3 Ingredients',
            description: 'Drop number, sign, number.',
        },
        step3: {
            title: 'Complete the Answer',
            description: 'Match the target to be correct.',
        },
    },
} as const;

export default manifest;
