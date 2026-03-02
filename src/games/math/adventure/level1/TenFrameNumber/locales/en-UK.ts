const manifest = {
    title: '10frame-number',
    subtitle: 'Count Fast, Think in Tens',
    description: 'ㅇㅇㅇ',
    powerups: {
        timeFreeze: 'ㅇㅇㅇ',
        extraLife: 'ㅇㅇㅇ',
        doubleScore: 'ㅇㅇㅇ'
    },
    ui: {
        placeholder: 'ㅇㅇㅇ',
        howManyHint: 'how many?'
    },
    howToPlay: {
        step1: { title: 'Check the cards', description: 'Count blue or red dots.' },
        step2: { title: 'Pick the number', description: 'Tap the correct answer.' },
        step3: { title: 'Clear sets', description: 'Build streaks and earn power-ups.' }
    }
} as const;

export default manifest;
