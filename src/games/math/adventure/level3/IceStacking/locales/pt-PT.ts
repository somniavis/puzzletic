const ptPT = {
    title: 'Torre de Gelo',
    subtitle: 'Empilha com cuidado e sem cair!',
    description: 'Larga conjuntos iguais de gelo na grelha e constrói uma torre estável.',
    howToPlay: {
        step1: {
            title: 'Ver missão',
            description: 'Vê a missão no topo.'
        },
        step2: {
            title: 'Tocar para largar',
            description: 'Toca para largar o conjunto.'
        },
        step3: {
            title: 'Manter equilíbrio',
            description: 'Empilha ao centro para concluir.'
        }
    },
    ui: {
        target: 'Alvo',
        bundles: 'Conjuntos',
        bundleCard: 'Conjunto atual de gelo',
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
