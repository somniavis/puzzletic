const esEs = {
    title: 'Tienda de Donas',
    subtitle: 'Empaca las donas por igual!',
    description: 'ㅇㅇㅇ',
    powerups: {
        timeFreeze: 'Freeze',
        extraLife: 'Life',
        doubleScore: 'Double'
    },
    ui: {
        mission: 'Empaca las donas en grupos de {{count}}.',
        dragDropHint: 'Toca para colocar cajas de donas.'
    },
    howToPlay: {
        step1: { title: 'Cuenta las donas', description: 'Cuenta las donas en la repisa.' },
        step2: { title: 'Coloca las cajas primero', description: 'Toca las ranuras punteadas para colocar cajas.' },
        step3: { title: 'Empaca por igual', description: 'Llena todas las cajas por igual.' }
    }
} as const;

export default esEs;
