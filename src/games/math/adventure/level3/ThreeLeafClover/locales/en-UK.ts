const enUK = {
    title: 'Three-Leaf Clover',
    subtitle: 'master 3s!',
    description: 'Grow clovers and master the 3 times table!',
    question: 'How many clover leaves are there?',
    powerups: {
        timeFreeze: 'Time Freeze',
        extraLife: 'Extra Life',
        doubleScore: 'Double Score'
    },
    a11y: {
        ladybug1: 'Ladybird 1',
        ladybug2: 'Ladybird 2',
        beetle: 'Beetle',
        cloverDot: 'Clover spot {{index}}'
    },
    ui: {
        tapEverySpotFirst: 'tap every spot first.'
    },
    howToPlay: {
        step1: { title: 'Check problem', description: 'Look at ☘️ 3×n.' },
        step2: { title: 'Grow clovers', description: 'Tap every spot.' },
        step3: { title: 'Pick answer', description: 'Choose the correct number.' }
    }
} as const;

export default enUK;
