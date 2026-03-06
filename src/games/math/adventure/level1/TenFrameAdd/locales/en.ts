const locale = {
    title: '10 frame-add',
    subtitle: 'Make 10 & 20',
    description: 'Fill and add to find the missing number.',
    question: 'What number goes in the blank?',
    powerups: {
        timeFreeze: 'Time Freeze',
        extraLife: 'Extra Life',
        doubleScore: 'Double Score'
    },
    ui: {
        tapRedHint: 'Tap the red dots!'
    },
    howToPlay: {
        step1: { title: 'Read the goal', description: 'Find the missing number.' },
        step2: { title: 'Flip dots', description: 'Turn red dots blue.' },
        step3: { title: 'Pick answer', description: 'Choose the right number.' }
    }
} as const;

export default locale;
