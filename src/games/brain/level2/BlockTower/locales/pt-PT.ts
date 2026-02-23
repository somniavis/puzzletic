const ptPT = {
    title: 'Torre de Blocos',
    subtitle: 'Empilha bem, mantém estável!',
    description: 'Larga blocos iguais na grelha e constrói uma torre estável.',
    howToPlay: {
        step1: {
            title: 'Tocar para largar',
            description: 'Toca para largar o bloco.'
        },
        step2: {
            title: 'Manter equilíbrio',
            description: 'Mantém a torre equilibrada.'
        },
        step3: {
            title: 'Subir mais',
            description: 'Chega ao topo para concluir.'
        }
    },
    ui: {
        target: 'Alvo',
        bundles: 'Conjuntos',
        bundleCard: 'Conjunto atual de gelo',
        balanceStatus: 'Equilíbrio',
        nextBlock: 'Próximo bloco',
        good: 'Bom',
        normal: 'Normal',
        risk: 'Risco',
        clickDropHint: 'Toca para largar!',
        dropHint: 'Move na grelha e toca para largar',
        defaultGuide: 'Constrói uma pilha estável para cumprir a missão.'
    },
    feedback: {
        success: 'Pilha perfeita! Próxima missão!',
        collapse: 'A pilha caiu! Tenta a mesma missão outra vez.'
    }
} as const;

export default ptPT;
