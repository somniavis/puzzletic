const fr = {
    title: 'Traversée de la rivière',
    subtitle: 'Trouve les bonnes pierres',
    description: 'Choisis seulement les pierres de division qui donnent le nombre cible et traverse jusqu’à l’arrivée.',
    powerups: {
        timeFreeze: 'Temps figé',
        extraLife: 'Vie bonus',
        doubleScore: 'Score doublé'
    },
    ui: {
        placeholderTitle: 'Traverse la rivière avec les bonnes expressions',
        placeholderBody: 'Choisis seulement les pierres de division qui correspondent au nombre cible et avance du départ à l’arrivée.',
        targetLabel: 'Cible',
        startLabel: 'Départ',
        goalLabel: 'Arrivée',
        boardAriaLabel: 'Plateau Traversée de la rivière',
        moveHint: 'Une pierre à la fois'
    },
    howToPlay: {
        step1: { title: 'Regarde la cible', description: 'Trouve la même valeur' },
        step2: { title: 'Avance d’un pas', description: 'Pierres proches seulement' },
        step3: { title: 'Atteins l’arrivée', description: 'Mauvaise pierre, tu tombes' }
    }
} as const;

export default fr;
