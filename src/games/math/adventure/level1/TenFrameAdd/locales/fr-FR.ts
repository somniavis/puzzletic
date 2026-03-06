const locale = {
    title: '10 frame-add',
    subtitle: 'Faire 10 et 20',
    description: 'Remplis les points pour trouver le nombre manquant.',
    question: 'Quel nombre va dans la case vide ?',
    powerups: {
        timeFreeze: 'Gel du temps',
        extraLife: 'Vie bonus',
        doubleScore: 'Score x2'
    },
    howToPlay: {
        step1: { title: 'Lis l’objectif', description: 'Trouve le nombre manquant.' },
        step2: { title: 'Retourne les points', description: 'Passe les points rouges en bleu.' },
        step3: { title: 'Choisis la réponse', description: 'Choisis le bon nombre.' }
    }
} as const;

export default locale;
