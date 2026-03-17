const esEs = {
    title: 'Chocolate Split',
    subtitle: 'Forma grupos iguales',
    description: 'ㅇㅇㅇ',
    powerups: {
        timeFreeze: 'Freeze',
        extraLife: 'Life',
        doubleScore: 'Double'
    },
    ui: {
        divideBy: 'Dividir entre',
        confirm: 'Comprobar',
        dragCutHint: 'Traza una línea y luego toca Comprobar',
        perGroupUnknown: 'Por grupo: ?',
        perGroupValue: 'Por grupo: {{value}}'
    },
    howToPlay: {
        step1: { title: 'Traza una linea', description: 'Traza entre los bloques' },
        step2: { title: 'Forma grupos iguales', description: 'Haz los grupos iguales' },
        step3: { title: 'Toca Comprobar', description: 'Toca cuando este bien' }
    }
} as const;

export default esEs;
