const pt = {
    title: 'Pizza Pizza',
    subtitle: 'Quantas para cada um?',
    description: 'ㅇㅇㅇ',
    powerups: {
        timeFreeze: 'Congelar tempo',
        extraLife: 'Vida extra',
        doubleScore: 'Pontuação dupla'
    },
    ui: {
        boardAriaLabel: 'Tabuleiro Pizza Pizza',
        bubbleText: `Vamos dividir uma pizza de {{pizzaType}} com {{sliceCount}} fatias entre {{friendCount}} amigos!`,
        answerChoicesAriaLabel: 'opcoes de resposta',
        choiceLabel: 'Cada um'
    },
    pizzaTypes: {
        pepperoni: 'pepperoni',
        cheese: 'queijo',
        veggie: 'legumes'
    },
    howToPlay: {
        step1: { title: 'Olha para a pizza', description: 'Vê como se divide' },
        step2: { title: 'Escolhe um número', description: 'Quantas para cada um' },
        step3: { title: 'Confere a divisão', description: 'Ganhas se for igual' }
    }
} as const;

export default pt;
