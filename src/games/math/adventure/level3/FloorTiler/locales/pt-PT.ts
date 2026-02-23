const ptPT = {
    title: 'Ladrilhador',
    subtitle: 'Preenche os ladrilhos na perfeição!',
    description: 'Usa largura e altura para encontrar a área e preencher os ladrilhos.',
    ui: {
        targetLabel: 'Ladrilho',
        progress: '{{filled}}/{{total}}',
        dragHint: 'Arrasta em células vazias para pintar um retângulo igual.',
        dragHintShort: 'Arrasta células vazias para igualar o ladrilho.',
        boardComplete: 'Ótimo! A passar para a próxima sala...'
    },
    howToPlay: {
        step1: {
            title: 'Ver ladrilho',
            description: 'Observa o tamanho a × b.'
        },
        step2: {
            title: 'Arrastar para pintar',
            description: 'Arrasta células vazias para igualar.'
        },
        step3: {
            title: 'Preencher chão',
            description: 'Preenche todas as células para concluir.'
        }
    }
} as const;

export default ptPT;
