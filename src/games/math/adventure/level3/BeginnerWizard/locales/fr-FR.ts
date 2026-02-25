export default {
    title: 'Sorcier débutant',
    subtitle: 'Maîtrise 0 et 1 !',
    description: 'Choisis la magie garder/retirer pour atteindre la cible.',
    ui: {
        targetLabel: 'Cible',
        protectHint: '🛡️ tout garder',
        removeHint: '🕳️ tout faire disparaître',
        tapSpellHint: 'Touchez le sort !'
    },
    powerups: {
        timeFreeze: 'Gel du temps',
        extraLife: 'Vie supplémentaire',
        doubleScore: 'Score doublé',
    },
    howToPlay: {
        step1: {
            title: 'Deux sorts',
            description: 'Entraîne-toi avec les deux sorts.'
        },
        step2: {
            title: 'x1 : sort de protection',
            description: 'Garde les animaux tels quels.'
        },
        step3: {
            title: 'x0 : sort de retrait',
            description: 'Envoie les animaux dans le trou noir.'
        }
    }
} as const;
