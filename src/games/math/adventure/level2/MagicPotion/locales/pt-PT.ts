const manifest = {
    title: 'Poção Mágica',
    'title-lv1': 'Poção Mágica (Lv1)',
    'title-lv2': 'Poção Mágica (Lv2)',
    subtitle: 'Mistura Ingredientes Mágicos!',
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
            title: 'Vê o alvo',
            description: 'Primeiro, vê o número-alvo.',
        },
        step2: {
            title: 'Escolhe 3 ingredientes',
            description: 'Solta número, sinal e número.',
        },
        step3: {
            title: 'Completa a resposta',
            description: 'Se igualar o alvo, está certo.',
        },
    },
} as const;

export default manifest;
