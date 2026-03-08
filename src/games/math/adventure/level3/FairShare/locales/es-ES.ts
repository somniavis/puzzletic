const manifest = {
    title: 'Fair Share',
    subtitle: '¡Reparte la misma cantidad!',
    description: 'Un juego de multiplicación para practicar las tablas del 2 y del 4.',
    powerups: {
        timeFreeze: 'Congelar',
        extraLife: 'Vida',
        doubleScore: 'Doble'
    },
    ui: {
        dragDropHint: 'Arrastra y suelta sobre las células',
        mission: 'Reparte por igual entre {{count}} amigos.'
    },
    howToPlay: {
        step1: {
            title: 'Cuenta a tus amigos',
            description: 'Cuenta cuántos amigos hay.'
        },
        step2: {
            title: 'Arrastra las frutas',
            description: 'Arrastra frutas a las canastas.'
        },
        step3: {
            title: 'Hazlo justo',
            description: '¡Iguala todas las canastas para ganar!'
        }
    }
} as const;

export default manifest;
