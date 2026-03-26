const en = {
    title: 'Scorpion King',
    subtitle: 'How Many Hits?',
    description: 'ㅇㅇㅇ',
    powerups: {
        timeFreeze: 'Time Freeze',
        extraLife: 'Extra Life',
        doubleScore: 'Double Score'
    },
    ui: {
        boardAriaLabel: 'Scorpion King board',
        hitsHint: 'How Many Hits?'
    },
    howToPlay: {
        step1: { title: 'Look at HP and power', description: 'Think about the hits' },
        step2: { title: 'Choose the number of hits', description: 'Pick the correct hit count' },
        step3: { title: 'Defeat the scorpion first', description: 'Win before Jello runs out of HP' }
    }
} as const;

export default en;
