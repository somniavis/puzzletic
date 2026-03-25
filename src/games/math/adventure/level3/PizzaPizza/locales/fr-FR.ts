const fr = {
    title: 'Pizza Pizza',
    subtitle: 'Combien pour chacun ?',
    description: 'ㅇㅇㅇ',
    powerups: {
        timeFreeze: 'Temps figé',
        extraLife: 'Vie bonus',
        doubleScore: 'Score doublé'
    },
    ui: {
        boardAriaLabel: 'Plateau Pizza Pizza',
        bubbleText: `Partageons une pizza {{pizzaType}} de {{sliceCount}} parts entre {{friendCount}} amis !`,
        answerChoicesAriaLabel: 'choix de reponse',
        choiceLabel: 'Chacun'
    },
    pizzaTypes: {
        pepperoni: 'pepperoni',
        cheese: 'au fromage',
        veggie: 'aux légumes'
    },
    howToPlay: {
        step1: { title: 'Regarde la pizza', description: 'Vois comment la partager' },
        step2: { title: 'Choisis un nombre', description: 'Combien pour chacun' },
        step3: { title: 'Vérifie le partage', description: 'Gagne si c est égal' }
    }
} as const;

export default fr;
