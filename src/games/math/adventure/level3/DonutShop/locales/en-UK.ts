const enUk = {
    title: 'Donut Shop',
    subtitle: 'Pack Donuts Equally!',
    description: 'ㅇㅇㅇ',
    powerups: {
        timeFreeze: 'Freeze',
        extraLife: 'Life',
        doubleScore: 'Double'
    },
    ui: {
        mission: 'Please pack donuts in groups of {{count}}.',
        dragDropHint: 'Tap to place donut boxes.'
    },
    howToPlay: {
        step1: { title: 'Check Donut Count', description: 'Count donuts on the shelf.' },
        step2: { title: 'Place Boxes First', description: 'Tap dotted slots to place boxes.' },
        step3: { title: 'Pack Equally', description: 'Fill every box equally.' }
    }
} as const;

export default enUk;
