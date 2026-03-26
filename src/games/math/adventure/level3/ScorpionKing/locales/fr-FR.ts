const fr = {
    title: 'Roi Scorpion',
    subtitle: 'Combien de coups ?',
    description: 'ㅇㅇㅇ',
    powerups: {
        timeFreeze: 'Temps fige',
        extraLife: 'Vie en plus',
        doubleScore: 'Score double'
    },
    ui: {
        boardAriaLabel: 'Plateau Scorpion King',
        hitsHint: 'Combien de coups ?'
    },
    howToPlay: {
        step1: { title: 'Regarde les PV et la force', description: 'Pense au nombre de coups' },
        step2: { title: 'Choisis le nombre de coups', description: 'Choisis le bon nombre' },
        step3: { title: 'Bats le scorpion en premier', description: 'Gagne avant que Jello perde tous ses PV' }
    }
} as const;

export default fr;
