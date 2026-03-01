const es = {
    title: 'Colmena Hexagonal',
    subtitle: '¡domina la tabla del 6!',
    description: 'Llena la colmena y domina la tabla del 6.',
    question: '¿Cuántos lados hay en total?',
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
        tapEverySpotFirst: 'Toca la cantidad correcta de hexágonos.'
    },
    howToPlay: {
        step1: { title: 'Revisa el problema', description: 'Mira ⬢ 6×n.' },
        step2: { title: 'Llena el panal', description: 'Toca hexágonos n veces.' },
        step3: { title: 'Elige la respuesta', description: 'Elige el número total de lados.' }
    }
} as const;

export default es;
