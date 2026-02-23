const manifest = {
    title: 'Corta Fruta',
    subtitle: 'Corta a Resposta!',
    description: 'Calcula o número em falta e corta a fruta para criar um snack saudável.',
    howToPlay: {
        step1: {
            title: 'Quantas fatias?',
            description: 'Decide primeiro o número.'
        },
        step2: {
            title: 'Escolher faca',
            description: 'Escolhe o número correspondente.'
        },
        step3: {
            title: 'Cortar fruta',
            description: 'Corta para enviar.'
        }
    },
    ui: {
        dragSliceHint: 'Arrasta a faca para cortar!'
    },
    powerups: {
        freeze: 'Congelar tempo',
        life: 'Vida extra',
        double: 'Pontuação 2x'
    }
};

export default manifest;
