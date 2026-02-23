const ptPT = {
    title: 'Caixa de Frutas',
    subtitle: 'Empacota conjuntos iguais!',
    description: 'Coloca os mesmos conjuntos de fruta em cada caixa.',
    howToPlay: {
        step1: {
            title: 'Ver pedido',
            description: 'Vê primeiro o cartão de pedido.'
        },
        step2: {
            title: 'Arrastar conjuntos',
            description: 'Arrasta os conjuntos para as caixas.'
        },
        step3: {
            title: 'Igualar tudo',
            description: 'Deixa todas as caixas iguais.'
        }
    },
    formulaHint: 'Preenche todas as caixas!',
    ui: {
        orderGroupsUnit: ' grupos',
        orderEachUnit: ' cada',
        dragToBoxHint: 'Arrasta as frutas para as caixas!'
    },
    feedback: {
        fillAll: 'Preenche primeiro todas as caixas.',
        retry: 'Tenta novamente com o mesmo pedido.'
    }
} as const;

export default ptPT;
