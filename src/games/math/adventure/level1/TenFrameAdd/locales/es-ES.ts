const locale = {
    title: '10 frame-add',
    subtitle: 'Haz 10 y 20',
    description: 'Cambia los puntos y encuentra el número que falta.',
    question: '¿Qué número va en el espacio vacío?',
    powerups: {
        timeFreeze: 'Congelar tiempo',
        extraLife: 'Vida extra',
        doubleScore: 'Puntuación x2'
    },
    howToPlay: {
        step1: { title: 'Mira la meta', description: 'Encuentra el número faltante.' },
        step2: { title: 'Voltea puntos', description: 'Cambia puntos rojos a azules.' },
        step3: { title: 'Elige respuesta', description: 'Elige el número correcto.' }
    }
} as const;

export default locale;
