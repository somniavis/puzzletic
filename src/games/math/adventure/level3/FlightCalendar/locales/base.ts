const base = {
    title: 'Flight Calendar',
    subtitle: 'Master 7s',
    description: 'Practice the 7-times table by filling calendar weeks.',
    question: 'How many days until departure?',
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
        tapEverySpotFirst: 'Tap the correct number of Sundays.'
    },
    weekdays: {
        mon: 'Mon',
        tue: 'Tue',
        wed: 'Wed',
        thu: 'Thu',
        fri: 'Fri',
        sat: 'Sat',
        sun: 'Sun'
    },
    howToPlay: {
        step1: { title: 'Check the Goal', description: 'Look at the target: 7 × n.' },
        step2: { title: 'Fill the Calendar', description: 'Tap Sunday to fill one week.' },
        step3: { title: 'Pick the Answer', description: 'Choose the days left.' }
    }
} as const;

export default base;
