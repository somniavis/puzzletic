const manifest = {
    title: 'Abrir o Cadeado',
    subtitle: 'Descobre o código!',
    description: 'Escolhe dois números para obter o número-alvo.',
    ui: {
        pickTwo: 'Escolhe dois números',
    },
    powerups: {
        timeFreeze: 'Congelar Tempo',
        extraLife: 'Vida Extra',
        doubleScore: 'Pontuação a Dobrar',
    },
    howToPlay: {
        step1: {
            title: 'Ver alvo +/-',
            description: 'Observa o número-alvo!',
        },
        step2: {
            title: 'Escolher dois números',
            description: 'Encontra os dois números do código!',
        },
        step3: {
            title: 'Desbloquear!',
            description: 'Sucesso! O cadeado abriu!',
        },
    },
} as const;

export default manifest;
