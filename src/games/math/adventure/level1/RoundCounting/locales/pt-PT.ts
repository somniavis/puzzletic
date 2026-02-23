export default {
    title: 'Gira e Encontra',
    subtitle: 'Acerta no Alvo em Movimento!',
    description: 'Encontra os itens-alvo! A grelha baralha sempre que encontras um.',
    howToPlay: {
        step1: { title: 'Quantos encontrar?', description: 'Vê primeiro a quantidade-alvo.' },
        step2: { title: 'Toque rápido', description: 'Toque depressa nos alvos iguais.' },
        step3: { title: 'Baralha a cada toque', description: 'Continua mesmo depois de baralhar.' }
    },
    ui: {
        clinks: 'Clique!',
        ready: 'Pronto'
    },
    target: 'Encontra {{count}} {{emoji}}',
    shuffleMessage: 'A baralhar!',
    powerups: {
        freeze: 'Congelar tempo!',
        life: 'Vida extra!',
        double: 'Pontuação a dobrar!'
    }
};
