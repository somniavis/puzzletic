const en = {
    title: 'Hex Hive',
    subtitle: 'master 6s!',
    description: 'Fill the hive and master the 6 times table!',
    question: 'How many sides in n hexagons?',
    powerups: {
        timeFreeze: 'Time Freeze',
        extraLife: 'Extra Life',
        doubleScore: 'Double Score'
    },
    a11y: {
        ladybug1: 'Ladybug 1',
        ladybug2: 'Ladybug 2',
        beetle: 'Beetle',
        cloverDot: 'Clover spot {{index}}'
    },
    ui: {
        tapEverySpotFirst: 'tap every spot first.'
    },
    howToPlay: {
        step1: { title: 'Read the problem', description: 'Check ⬢ 6×n.' },
        step2: { title: 'Fill the hive', description: 'Tap hexes n times.' },
        step3: { title: 'Choose the answer', description: 'Pick the total number of sides.' }
    }
} as const;

export default en;
