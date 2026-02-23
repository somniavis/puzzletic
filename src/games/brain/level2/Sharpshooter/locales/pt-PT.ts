const manifest = {
    title: 'Arqueiro Mestre',
    subtitle: 'Acerta no alvo certo!',
    description: 'Resolve a equação e atira no alvo correto.',
    howToPlay: {
        step1: { title: 'Ver alvo', description: 'Observa o símbolo-alvo.' },
        step2: { title: 'Seguir alvos', description: 'Encontra o símbolo igual.' },
        step3: { title: 'Disparar', description: 'Anéis: 10/8/6 (×10).' }
    },
    powerups: {
        freeze: 'Congelar Tempo',
        life: 'Vida Extra',
        double: 'Pontuação a Dobrar'
    },
    ui: {
        pullShootHint: 'Puxa e dispara!',
        targetLabel: 'alvo'
    }
};

export default manifest;
