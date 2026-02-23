const es = {
    title: 'Salto de Rana',
    subtitle: '¡Salta, salta, salta!',
    description: 'Elige el valor correcto y haz que la rana salte.',
    powerups: {
        timeFreeze: 'Congelar tiempo',
        extraLife: 'Vida extra',
        doubleScore: 'Puntuación doble',
    },
    howToPlay: {
        step1: {
            title: '¡Mira las marcas!',
            description: 'Calcula la distancia del salto.'
        },
        step2: {
            title: 'Toca un número',
            description: 'Encuentra y elige la respuesta.'
        },
        step3: {
            title: '¡Salta y aterriza!',
            description: 'Llega a la marca correcta para superarlo.'
        }
    }
} as const;

export default es;
