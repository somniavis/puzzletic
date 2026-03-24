const pt = {
    title: 'Travessia do Rio',
    subtitle: 'Encontra as pedras certas',
    description: 'Escolhe apenas as pedras de divisão que correspondem ao número-alvo e atravessa até à meta.',
    powerups: {
        timeFreeze: 'Congelar tempo',
        extraLife: 'Vida extra',
        doubleScore: 'Pontuação dupla'
    },
    ui: {
        placeholderTitle: 'Atravessa o rio com expressões corretas',
        placeholderBody: 'Escolhe apenas as pedras de divisão que correspondem ao número-alvo e vai do início até à meta.',
        targetLabel: 'Alvo',
        startLabel: 'Início',
        goalLabel: 'Meta',
        boardAriaLabel: 'Tabuleiro Travessia do Rio',
        moveHint: 'Uma pedra de cada vez!'
    },
    howToPlay: {
        step1: { title: 'Vê o alvo', description: 'Encontra o mesmo valor' },
        step2: { title: 'Avança um passo', description: 'Só pedras próximas' },
        step3: { title: 'Chega à meta', description: 'Pedra errada, cais' }
    }
} as const;

export default pt;
