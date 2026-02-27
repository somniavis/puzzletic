const fr = {
    title: 'Trefle a Trois Feuilles',
    subtitle: 'maitrise la table de 3 !',
    description: 'Fais pousser des trefles et maitrise la table de 3.',
    question: 'Combien de feuilles de trefle y a-t-il au total ?',
    powerups: {
        timeFreeze: 'Temps fige',
        extraLife: 'Vie en plus',
        doubleScore: 'Score x2'
    },
    a11y: {
        ladybug1: 'Coccinelle 1',
        ladybug2: 'Coccinelle 2',
        beetle: 'Scarabee',
        cloverDot: 'Point de trefle {{index}}'
    },
    ui: {
        tapEverySpotFirst: 'tap every spot first.'
    },
    howToPlay: {
        step1: { title: 'Verifie le probleme', description: 'Regarde ☘️ 3×n.' },
        step2: { title: 'Fais pousser les trefles', description: 'Tape tous les points.' },
        step3: { title: 'Choisis la reponse', description: 'Choisis le bon nombre.' }
    }
} as const;

export default fr;
