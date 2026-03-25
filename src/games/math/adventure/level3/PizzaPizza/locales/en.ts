const en = {
    title: 'Pizza Pizza',
    subtitle: 'How Many for Each?',
    description: 'ㅇㅇㅇ',
    powerups: {
        timeFreeze: 'Time Freeze',
        extraLife: 'Extra Life',
        doubleScore: 'Double Score'
    },
    ui: {
        boardAriaLabel: 'Pizza Pizza board',
        bubbleText: `Let's share {{sliceCount}} slices with {{friendCount}} friends!`,
        answerChoicesAriaLabel: 'answer choices',
        choiceLabel: 'Each'
    },
    pizzaTypes: {
        pepperoni: 'pepperoni',
        cheese: 'cheese',
        veggie: 'veggie'
    },
    howToPlay: {
        step1: { title: 'Look at the pizza', description: 'See how it can split' },
        step2: { title: 'Pick a number', description: 'How many each' },
        step3: { title: 'Check the split', description: 'Win if equal' }
    }
} as const;

export default en;
