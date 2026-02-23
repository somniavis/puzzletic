const manifest = {
    title: 'Lock Opening',
    subtitle: 'Find the passcode!',
    description: 'Choose two numbers to make the target number.',
    ui: {
        pickTwo: 'Pick two numbers',
    },
    powerups: {
        timeFreeze: 'Time Freeze',
        extraLife: 'Extra Life',
        doubleScore: 'Double Score',
    },
    howToPlay: {
        step1: {
            title: 'Check +/- Target',
            description: 'Check the target number!',
        },
        step2: {
            title: 'Pick Two Numbers',
            description: 'Find the two passcode numbers!',
        },
        step3: {
            title: 'Unlock!',
            description: 'Success! The lock is open!',
        },
    },
} as const;

export default manifest;
