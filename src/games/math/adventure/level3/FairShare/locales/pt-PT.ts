const manifest = {
    title: 'Fair Share',
    subtitle: 'Partilha o mesmo número!',
    description: 'Um jogo de multiplicação para praticar as tabuadas do 2 e do 4.',
    powerups: {
        timeFreeze: 'Congelar',
        extraLife: 'Vida',
        doubleScore: 'Dobro'
    },
    ui: {
        dragDropHint: 'Arrasta e larga nas células',
        mission: 'Partilha igualmente entre {{count}} amigos.'
    },
    howToPlay: {
        step1: {
            title: 'Conta os teus amigos',
            description: 'Conta quantos amigos há.'
        },
        step2: {
            title: 'Arrasta as frutas',
            description: 'Arrasta as frutas para os cestos.'
        },
        step3: {
            title: 'Partilha por igual',
            description: 'Iguala todos os cestos para ganhar!'
        }
    }
} as const;

export default manifest;
