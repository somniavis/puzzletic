const enUk = {
    title: 'Chocolate Split',
    subtitle: 'Make Equal Groups',
    description: 'ㅇㅇㅇ',
    powerups: {
        timeFreeze: 'Freeze',
        extraLife: 'Life',
        doubleScore: 'Double'
    },
    ui: {
        divideBy: 'Divide by',
        confirm: 'Break It',
        dragCutHint: 'Draw a line, then tap Break It!',
        perGroupUnknown: 'Per group: ?',
        perGroupValue: 'Per group: {{value}}'
    },
    howToPlay: {
        step1: { title: 'Draw a line', description: 'Draw between the bricks' },
        step2: { title: 'Make equal groups', description: 'Make the groups equal' },
        step3: { title: 'Tap Break It', description: 'Tap when it looks right' }
    }
} as const;

export default enUk;
