const manifest = {
    title: 'Clonagem Celular',
    subtitle: 'Domina as tabuadas do 2 e do 4!',
    description: 'Um jogo de multiplicação para praticar as tabuadas do 2 e do 4.',
    powerups: {
        timeFreeze: 'Congelar',
        extraLife: 'Vida',
        doubleScore: 'Dobro'
    },
    ui: {
        dragDropHint: 'Arrasta e larga nas células'
    },
    howToPlay: {
        step1: {
            title: 'Conta as células',
            description: 'Conta as células do centro.'
        },
        step2: {
            title: 'Vê o objetivo',
            description: 'Confere cor e número.'
        },
        step3: {
            title: 'Arrasta para clonar',
            description: 'Larga o reagente e acerta.'
        }
    }
} as const;

export default manifest;
