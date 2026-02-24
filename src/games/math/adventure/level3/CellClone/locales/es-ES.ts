const manifest = {
    title: 'Clonación Celular',
    subtitle: '¡Domina las tablas del 2 y 4!',
    description: 'Un juego de multiplicación para practicar las tablas del 2 y del 4.',
    powerups: {
        timeFreeze: 'Congelar',
        extraLife: 'Vida',
        doubleScore: 'Doble'
    },
    ui: {
        dragDropHint: 'Arrastra y suelta sobre las células'
    },
    howToPlay: {
        step1: {
            title: 'Cuenta las células',
            description: 'Cuenta las del centro.'
        },
        step2: {
            title: 'Mira el objetivo',
            description: 'Revisa color y número.'
        },
        step3: {
            title: 'Arrastra y clona',
            description: 'Suelta el reactivo y acierta.'
        }
    }
} as const;

export default manifest;
