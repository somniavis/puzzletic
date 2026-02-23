const es = {
    title: 'Torre de Bloques',
    subtitle: '¡Apila con cabeza, mantén el equilibrio!',
    description: 'Suelta bloques iguales sobre la cuadrícula y construye una torre estable.',
    howToPlay: {
        step1: {
            title: 'Toca para soltar',
            description: 'Toca para soltar el bloque.'
        },
        step2: {
            title: 'Mantén el equilibrio',
            description: 'Mantén la torre equilibrada.'
        },
        step3: {
            title: 'Construye más alto',
            description: 'Llega arriba para superar.'
        }
    },
    ui: {
        target: 'Objetivo',
        bundles: 'Lotes',
        bundleCard: 'Bloque actual',
        balanceStatus: 'Equilibrio',
        nextBlock: 'Siguiente bloque',
        good: 'Bien',
        normal: 'Normal',
        risk: 'Riesgo',
        clickDropHint: '¡Toca para soltar!',
        dropHint: 'Muévete por la cuadrícula y toca para soltar',
        defaultGuide: 'Construye una pila estable para superar la misión.'
    },
    feedback: {
        success: '¡Apilado perfecto! ¡Siguiente misión!',
        collapse: '¡La torre se derrumbó! Intenta la misma misión otra vez.'
    }
} as const;

export default es;
