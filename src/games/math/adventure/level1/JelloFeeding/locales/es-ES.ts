const manifest = {
    title: 'Alimenta a Jello',
    subtitle: '¡Jello tiene hambre!',
    description: 'Arrastra frutas a Jello y completa tu misión de resta.',
    howToPlay: {
        step1: {
            title: 'Elige frutas',
            description: 'Arrástralas desde el panel inicial'
        },
        step2: {
            title: 'Alimenta a Jello',
            description: 'Suéltalas sobre Jello en movimiento'
        },
        step3: {
            title: 'Pulsa comprobar',
            description: 'Si aciertas, pasas al siguiente'
        }
    },
    labels: {
        fed: 'Dado',
        remaining: 'Restante'
    },
    ui: {
        dragFeedHint: '¡Arrastra comida para alimentar!'
    },
    question: '8 - 3 = ?'
};

export default manifest;
