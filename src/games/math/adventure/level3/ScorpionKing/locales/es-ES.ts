const es = {
    title: 'Rey Escorpion',
    subtitle: 'Cuantos golpes?',
    description: 'ㅇㅇㅇ',
    powerups: {
        timeFreeze: 'Tiempo congelado',
        extraLife: 'Vida extra',
        doubleScore: 'Puntuacion doble'
    },
    ui: {
        boardAriaLabel: 'Tablero de Scorpion King',
        hitsHint: 'Cuantos golpes?'
    },
    howToPlay: {
        step1: { title: 'Mira la vida y el poder', description: 'Piensa en los golpes' },
        step2: { title: 'Elige el numero de golpes', description: 'Elige la cantidad correcta' },
        step3: { title: 'Derrota primero al escorpion', description: 'Gana antes de que Jello pierda toda su vida' }
    }
} as const;

export default es;
