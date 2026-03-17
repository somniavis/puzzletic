const frFr = {
    title: 'Chocolate Split',
    subtitle: 'Fais des groupes egaux',
    description: 'ㅇㅇㅇ',
    powerups: {
        timeFreeze: 'Freeze',
        extraLife: 'Life',
        doubleScore: 'Double'
    },
    ui: {
        divideBy: 'Diviser par',
        confirm: 'Vérifier',
        dragCutHint: 'Trace une ligne, puis appuie sur Vérifier',
        perGroupUnknown: 'Par groupe : ?',
        perGroupValue: 'Par groupe : {{value}}'
    },
    howToPlay: {
        step1: { title: 'Trace une ligne', description: 'Trace entre les blocs' },
        step2: { title: 'Fais des groupes egaux', description: 'Rends les groupes egaux' },
        step3: { title: 'Appuie sur Verifier', description: 'Appuie quand c est bon' }
    }
} as const;

export default frFr;
