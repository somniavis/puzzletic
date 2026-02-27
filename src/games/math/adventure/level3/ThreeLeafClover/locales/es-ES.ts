const es = {
    title: 'Trebol de Tres Hojas',
    subtitle: '¡domina la tabla del 3!',
    description: 'Haz crecer treboles y domina la tabla del 3.',
    question: '¿Cuantas hojas de trebol hay en total?',
    powerups: {
        timeFreeze: 'Congelar tiempo',
        extraLife: 'Vida extra',
        doubleScore: 'Puntos dobles'
    },
    a11y: {
        ladybug1: 'Mariquita 1',
        ladybug2: 'Mariquita 2',
        beetle: 'Escarabajo',
        cloverDot: 'Punto de trebol {{index}}'
    },
    ui: {
        tapEverySpotFirst: 'tap every spot first.'
    },
    howToPlay: {
        step1: { title: 'Revisa el problema', description: 'Mira ☘️ 3×n.' },
        step2: { title: 'Haz crecer treboles', description: 'Toca todos los puntos.' },
        step3: { title: 'Elige la respuesta', description: 'Elige el numero correcto.' }
    }
} as const;

export default es;
