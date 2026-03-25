const es = {
    title: 'Pizza Pizza',
    subtitle: 'Cuantas por cada uno?',
    description: 'ㅇㅇㅇ',
    powerups: {
        timeFreeze: 'Congelar tiempo',
        extraLife: 'Vida extra',
        doubleScore: 'Puntuación doble'
    },
    ui: {
        boardAriaLabel: 'Tablero Pizza Pizza',
        bubbleText: `¡Repartamos una pizza de {{pizzaType}} de {{sliceCount}} porciones entre {{friendCount}} amigos!`,
        answerChoicesAriaLabel: 'opciones de respuesta',
        choiceLabel: 'Cada uno'
    },
    pizzaTypes: {
        pepperoni: 'pepperoni',
        cheese: 'queso',
        veggie: 'verduras'
    },
    howToPlay: {
        step1: { title: 'Mira la pizza', description: 'Piensa cómo se divide' },
        step2: { title: 'Elige un número', description: 'Cuántas para cada uno' },
        step3: { title: 'Comprueba el reparto', description: 'Ganas si es igual' }
    }
} as const;

export default es;
