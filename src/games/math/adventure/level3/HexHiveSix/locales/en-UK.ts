const enUK = {
    title: 'Hex Hive',
    subtitle: 'master 6s!',
    description: 'Fill the hive and master the 6 times table!',
    question: 'How many sides are there in total?',
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
        tapEverySpotFirst: 'Tap the right number of hexes.'
    },
    howToPlay: {
        step1: { title: 'Read the problem', description: 'Check ⬢ 6×n.' },
        step2: { title: 'Fill the hive', description: 'Tap hexes n times.' },
        step3: { title: 'Choose the answer', description: 'Pick the total number of sides.' }
    }
} as const;

export default enUK;
