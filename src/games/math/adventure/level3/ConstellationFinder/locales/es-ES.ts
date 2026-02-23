const es = {
    title: 'Buscador de Constelaciones',
    subtitle: '¡Ilumina las estrellas!',
    description: 'Resuelve multiplicaciones de 1 cifra y completa cada constelación.',
    howToPlay: {
        step1: {
            title: 'Mira la ecuación',
            description: 'Resuelve la ecuación.'
        },
        step2: {
            title: 'Ilumina la estrella',
            description: 'Toca la estrella correcta.'
        },
        step3: {
            title: 'Completa el conjunto',
            description: 'Enciende todas las estrellas y luego comprueba.'
        }
    },
    difficulty: {
        low: 'Fácil',
        mid: 'Medio',
        high: 'Difícil',
        top: 'Muy difícil'
    },
    sets: {
        northDipper: 'Osa Mayor',
        january: 'Enero · Capricornio',
        february: 'Febrero · Acuario',
        march: 'Marzo · Piscis',
        april: 'Abril · Aries',
        may: 'Mayo · Tauro',
        june: 'Junio · Géminis',
        july: 'Julio · Cáncer',
        august: 'Agosto · Leo',
        september: 'Septiembre · Virgo',
        october: 'Octubre · Libra',
        november: 'Noviembre · Escorpio',
        december: 'Diciembre · Sagitario'
    },
    ui: {
        setLabel: 'Conjunto {{current}}/{{total}}',
        clickCorrectStarHint: '¡Toca la estrella correcta!',
        solveGuide: 'Encuentra la respuesta de estrella correcta.',
        solveGuideSub: 'Un toque incorrecto cuesta 1 vida. Uno correcto enciende la estrella.',
        clearedTitle: '¡{{name}} completada!',
        clearedSub: 'Pulsa comprobar para pasar al siguiente conjunto.'
    }
} as const;

export default es;
