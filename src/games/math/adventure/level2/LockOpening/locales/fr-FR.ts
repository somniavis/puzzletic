const manifest = {
    title: 'Code du cadenas',
    subtitle: 'Trouve le code !',
    description: 'Choisis deux nombres pour obtenir le nombre cible.',
    ui: {
        pickTwo: 'Choisis deux nombres',
    },
    powerups: {
        timeFreeze: 'Gel du temps',
        extraLife: 'Vie supplémentaire',
        doubleScore: 'Score doublé',
    },
    howToPlay: {
        step1: {
            title: 'Vérifie la cible +/-',
            description: 'Regarde le nombre cible !',
        },
        step2: {
            title: 'Choisis deux nombres',
            description: 'Trouve les deux nombres du code !',
        },
        step3: {
            title: 'Déverrouille !',
            description: 'Succès ! Le cadenas est ouvert !',
        },
    },
} as const;

export default manifest;
