const fr = {
    title: 'Ruche Hexagonale',
    subtitle: 'maitrise la table de 6 !',
    description: 'Remplis la ruche et maitrise la table de 6.',
    question: 'Combien de côtés dans n hexagones ?',
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
        step1: { title: 'Vérifie le problème', description: 'Regarde ⬢ 6×n.' },
        step2: { title: 'Remplis la ruche', description: 'Tape n fois les hexagones.' },
        step3: { title: 'Choisis la réponse', description: 'Choisis le nombre total de côtés.' }
    }
} as const;

export default fr;
