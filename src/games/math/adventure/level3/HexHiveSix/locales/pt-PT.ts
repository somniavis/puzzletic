const pt = {
    title: 'Colmeia Hexagonal',
    subtitle: 'domina a tabuada do 6!',
    description: 'Preenche a colmeia e domina a tabuada do 6.',
    question: 'Quantos lados há ao todo?',
    powerups: {
        timeFreeze: 'Congelar tempo',
        extraLife: 'Vida extra',
        doubleScore: 'Pontuacao dupla'
    },
    a11y: {
        ladybug1: 'Joaninha 1',
        ladybug2: 'Joaninha 2',
        beetle: 'Besouro',
        cloverDot: 'Ponto do trevo {{index}}'
    },
    ui: {
        tapEverySpotFirst: 'Toca no número certo de hexágonos.'
    },
    howToPlay: {
        step1: { title: 'Ver o problema', description: 'Vê ⬢ 6×n.' },
        step2: { title: 'Preencher a colmeia', description: 'Toca nos hexágonos n vezes.' },
        step3: { title: 'Escolher resposta', description: 'Escolhe o total de lados.' }
    }
} as const;

export default pt;
