const manifest = {
    title: 'Abre el Candado',
    subtitle: '¡Encuentra el código!',
    description: 'Elige dos números para formar el número objetivo.',
    ui: {
        pickTwo: 'Elige dos números',
    },
    powerups: {
        timeFreeze: 'Congelar tiempo',
        extraLife: 'Vida extra',
        doubleScore: 'Puntuación doble',
    },
    howToPlay: {
        step1: {
            title: 'Mira el objetivo +/-',
            description: '¡Comprueba el número objetivo!',
        },
        step2: {
            title: 'Elige dos números',
            description: '¡Encuentra los dos números del código!',
        },
        step3: {
            title: '¡Desbloquea!',
            description: '¡Perfecto! ¡El candado se abre!',
        },
    },
} as const;

export default manifest;
