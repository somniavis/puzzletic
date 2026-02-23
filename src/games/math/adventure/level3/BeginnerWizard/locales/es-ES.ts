export default {
    title: 'Mago Principiante',
    subtitle: '¡Domina las tablas del 0 y del 1!',
    description: 'Elige el hechizo de proteger o borrar para acertar el objetivo.',
    ui: {
        targetLabel: 'Objetivo',
        protectHint: '🛡️ conservar todo',
        removeHint: '🕳️ borrar todo',
        tapSpellHint: '¡Toca el hechizo!'
    },
    powerups: {
        timeFreeze: 'Congelar tiempo',
        extraLife: 'Vida extra',
        doubleScore: 'Puntuación doble',
    },
    howToPlay: {
        step1: {
            title: 'Dos hechizos',
            description: 'Practica los dos.'
        },
        step2: {
            title: 'x1: Hechizo de protección',
            description: 'Mantiene a los animales tal cual.'
        },
        step3: {
            title: 'x0: Hechizo de borrado',
            description: 'Envía a los animales al agujero negro.'
        }
    }
} as const;
