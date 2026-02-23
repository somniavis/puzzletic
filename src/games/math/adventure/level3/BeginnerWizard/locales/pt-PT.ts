export default {
    title: 'Mago Iniciante',
    subtitle: 'Domina o 0 e o 1!',
    description: 'Escolhe magia de proteger/remover para acertar no alvo.',
    ui: {
        targetLabel: 'Alvo',
        protectHint: '🛡️ manter todos',
        removeHint: '🕳️ remover todos',
        tapSpellHint: 'Toca no feitiço!'
    },
    powerups: {
        timeFreeze: 'Congelar Tempo',
        extraLife: 'Vida Extra',
        doubleScore: 'Pontuação a Dobrar',
    },
    howToPlay: {
        step1: {
            title: 'Dois feitiços',
            description: 'Pratica os dois feitiços.'
        },
        step2: {
            title: 'x1: Feitiço de proteção',
            description: 'Mantém os animais como estão.'
        },
        step3: {
            title: 'x0: Feitiço de remoção',
            description: 'Envia os animais para o buraco negro.'
        }
    }
} as const;
