export default {
    title: 'Gira y Encuentra',
    subtitle: '¡Atrapa el objetivo en movimiento!',
    description: '¡Encuentra los elementos objetivo! La cuadrícula se mezcla cada vez que aciertas uno.',
    howToPlay: {
        step1: { title: '¿Cuántos hay que encontrar?', description: 'Primero mira la cantidad objetivo.' },
        step2: { title: 'Pulsa rápido', description: 'Pulsa rápido los objetivos correctos.' },
        step3: { title: 'Se mezcla en cada toque', description: 'Sigue incluso después de mezclar.' }
    },
    ui: {
        clinks: '¡Pulsa!',
        ready: 'Listo'
    },
    target: 'Encuentra {{count}} {{emoji}}',
    shuffleMessage: '¡Mezclando!',
    powerups: {
        freeze: '¡Congelar tiempo!',
        life: '¡Vida extra!',
        double: '¡Puntuación doble!'
    }
};
