const es = {
    title: 'Torre de Hielo',
    subtitle: '¡Apila con cuidado y no la tires!',
    description: 'Suelta lotes iguales de hielo sobre la cuadrícula y construye una torre estable.',
    howToPlay: {
        step1: {
            title: 'Mira la misión',
            description: 'Revisa la misión de arriba.'
        },
        step2: {
            title: 'Toca para soltar',
            description: 'Toca para soltar el lote.'
        },
        step3: {
            title: 'Mantén el equilibrio',
            description: 'Apila en el centro para superar.'
        }
    },
    ui: {
        target: 'Objetivo',
        bundles: 'Lotes',
        bundleCard: 'Lote de hielo actual',
        clickDropHint: '¡Toca para soltar!',
        dropHint: 'Muévete por la cuadrícula y toca para soltar',
        defaultGuide: 'Construye una pila estable para superar la misión.'
    },
    feedback: {
        success: '¡Apilado perfecto! ¡Siguiente misión!',
        collapse: '¡La pila se derrumbó! Intenta la misma misión otra vez.'
    }
} as const;

export default es;
