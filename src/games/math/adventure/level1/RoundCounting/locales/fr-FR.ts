export default {
    title: 'Tourne et trouve',
    subtitle: 'Attrape la cible en mouvement !',
    description: 'Trouve les éléments cibles ! La grille se mélange à chaque trouvaille.',
    howToPlay: {
        step1: { title: 'Combien à trouver ?', description: 'Regarde d’abord le nombre cible.' },
        step2: { title: 'Tape vite', description: 'Tape rapidement les bonnes cibles.' },
        step3: { title: 'La grille se mélange', description: 'Continue même après chaque mélange.' }
    },
    ui: {
        clinks: 'Clique !',
        ready: 'Prêt'
    },
    target: 'Trouve {{count}} {{emoji}}',
    shuffleMessage: 'Mélange !',
    powerups: {
        freeze: 'Gel du temps !',
        life: 'Vie supplémentaire !',
        double: 'Score x2 !'
    }
};
