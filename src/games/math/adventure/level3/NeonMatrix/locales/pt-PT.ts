const manifest = {
    title: 'Matriz Néon',
    subtitle: 'Domina a tabuada do 8!',
    description: 'Um puzzle rápido para dominar o padrão final da tabuada do 8.',
    powerups: {
        timeFreeze: 'Congelar',
        extraLife: 'Vida',
        doubleScore: 'Dobro'
    },
    ui: {
        tapHint: 'Toca 8, 6, 4, 2 ou 0 para preencher.',
        dragDropHint: 'Toca 8, 6, 4, 2 ou 0 para preencher.',
        patternHint: 'Lembra-te de 8-6-4-2-0!',
        signTitle: 'Código Secreto da Tabuada do 8',
        signCode: '8-6-4-2-0',
        cellLabel: '8x{{index}}',
        cellAriaLabel: 'Célula da matriz {{index}}',
        modePattern: 'Faixa de Padrão',
        modeVertical: 'Correspondência Vertical'
    },
    howToPlay: {
        step1: {
            title: '8-6-4-2-0!',
            description: 'Lembra o padrão.'
        },
        step2: {
            title: 'Insere dígitos',
            description: 'Toca nos números certos.'
        },
        step3: {
            title: 'Set concluído',
            description: 'Sobe o combo!'
        }
    }
} as const;

export default manifest;
