const manifest = {
    title: 'Número em 10 quadros',
    subtitle: 'Conta rápido, pensa em dezenas',
    description: 'ㅇㅇㅇ',
    powerups: {
        timeFreeze: 'ㅇㅇㅇ',
        extraLife: 'ㅇㅇㅇ',
        doubleScore: 'ㅇㅇㅇ'
    },
    ui: {
        placeholder: 'ㅇㅇㅇ',
        howManyHint: 'quantos?'
    },
    howToPlay: {
        step1: { title: 'Vê as cartas', description: 'Conta os pontos azuis ou vermelhos.' },
        step2: { title: 'Escolhe o número', description: 'Toca na resposta certa.' },
        step3: { title: 'Completa séries', description: 'Faz sequências e ganha poderes.' }
    }
} as const;

export default manifest;
