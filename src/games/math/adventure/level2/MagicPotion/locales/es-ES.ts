const manifest = {
    title: 'Magic Potion',
    'title-lv1': 'Magic Potion (Lv1)',
    'title-lv2': 'Magic Potion (Lv2)',
    subtitle: '¡Mezcla ingredientes mágicos!',
    description: 'ㅇㅇㅇ',
    ui: {
        placeholder: 'ㅇㅇㅇ',
        makeLabel: 'MAKE',
        dragHint: 'Drag and drop 3 ingredients!',
        correct: 'CORRECT!',
        wrong: 'MISS!',
    },
    powerups: {
        timeFreeze: 'Time Freeze',
        extraLife: 'Extra Life',
        doubleScore: 'Double Score',
    },
    howToPlay: {
        step1: {
            title: 'Revisa la meta',
            description: 'Mira primero el número objetivo.',
        },
        step2: {
            title: 'Elige 3 ingredientes',
            description: 'Pon número, signo y número.',
        },
        step3: {
            title: 'Completa la respuesta',
            description: 'Si coincide con la meta, acierto.',
        },
    },
} as const;

export default manifest;
