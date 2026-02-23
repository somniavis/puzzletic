const manifest = {
    title: 'Alimentar Jello',
    subtitle: 'O Jello está com fome!',
    description: 'Arrasta frutas para o Jello e verifica a missão de subtração.',
    howToPlay: {
        step1: {
            title: 'Escolher frutas',
            description: 'Arrasta a partir do painel inicial'
        },
        step2: {
            title: 'Alimentar Jello',
            description: 'Larga no Jello em movimento'
        },
        step3: {
            title: 'Toque em verificar',
            description: 'Se estiver correto, avança'
        }
    },
    labels: {
        fed: 'Dado',
        remaining: 'Falta'
    },
    ui: {
        dragFeedHint: 'Arrasta comida para alimentar!'
    },
    question: '8 - 3 = ?'
};

export default manifest;
