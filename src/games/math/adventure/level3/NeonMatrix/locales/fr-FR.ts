const manifest = {
    title: 'Neon Matrix',
    subtitle: 'Maîtrise la table de 8 !',
    description: 'Un puzzle rapide pour maîtriser le motif final de la table de 8.',
    powerups: {
        timeFreeze: 'Gel',
        extraLife: 'Vie',
        doubleScore: 'x2'
    },
    ui: {
        tapHint: 'Tape 8, 6, 4, 2 ou 0 pour compléter.',
        dragDropHint: 'Tape 8, 6, 4, 2 ou 0 pour compléter.',
        patternHint: 'Retiens 8-6-4-2-0 !',
        signTitle: 'Code secret de la table de 8',
        signCode: '8-6-4-2-0',
        cellLabel: '8x{{index}}',
        cellAriaLabel: 'Case matrice {{index}}',
        modePattern: 'Voie Motif',
        modeVertical: 'Match Vertical'
    },
    howToPlay: {
        step1: {
            title: '8-6-4-2-0 !',
            description: 'Mémorise le motif.'
        },
        step2: {
            title: 'Saisis les chiffres',
            description: 'Tape les bons chiffres.'
        },
        step3: {
            title: 'Set terminé',
            description: 'Monte le combo !'
        }
    }
} as const;

export default manifest;
