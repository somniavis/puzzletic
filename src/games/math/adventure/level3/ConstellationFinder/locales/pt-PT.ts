const ptPT = {
    title: 'Caçador de Constelações',
    subtitle: 'Ilumina as estrelas!',
    description: 'Resolve multiplicações de 1 algarismo e completa cada conjunto de constelações.',
    howToPlay: {
        step1: {
            title: 'Ver equação',
            description: 'Resolve a equação.'
        },
        step2: {
            title: 'Iluminar estrela',
            description: 'Toca na estrela correta.'
        },
        step3: {
            title: 'Completar conjunto',
            description: 'Acende todas e confirma.'
        }
    },
    difficulty: {
        low: 'Fácil',
        mid: 'Médio',
        high: 'Difícil',
        top: 'Muito difícil'
    },
    sets: {
        northDipper: 'Ursa Maior',
        january: 'Janeiro · Capricórnio',
        february: 'Fevereiro · Aquário',
        march: 'Março · Peixes',
        april: 'Abril · Carneiro',
        may: 'Maio · Touro',
        june: 'Junho · Gémeos',
        july: 'Julho · Caranguejo',
        august: 'Agosto · Leão',
        september: 'Setembro · Virgem',
        october: 'Outubro · Balança',
        november: 'Novembro · Escorpião',
        december: 'Dezembro · Sagitário'
    },
    ui: {
        setLabel: 'Conjunto {{current}}/{{total}}',
        clickCorrectStarHint: 'Toca na estrela correta!',
        solveGuide: 'Encontra a estrela com a resposta certa.',
        solveGuideSub: 'Toque errado custa 1 vida. Toque certo ilumina a estrela.',
        clearedTitle: '{{name}} concluída!',
        clearedSub: 'Carrega em confirmar para passar ao próximo conjunto.'
    }
} as const;

export default ptPT;
