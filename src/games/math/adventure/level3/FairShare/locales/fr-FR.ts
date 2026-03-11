const manifest = {
    title: 'Partage Équitable',
    subtitle: 'Même quantité pour tous !',
    description: 'Un jeu de multiplication pour les tables de 2 et de 4.',
    powerups: {
        timeFreeze: 'Gel',
        extraLife: 'Vie',
        doubleScore: 'x2'
    },
    ui: {
        dragDropHint: 'Glisser-déposer sur les cellules',
        mission: 'Partage également entre {{count}} amis.'
    },
    howToPlay: {
        step1: {
            title: 'Compte tes amis',
            description: 'Compte combien d’amis il y a.'
        },
        step2: {
            title: 'Glisse les fruits',
            description: 'Glisse les fruits dans les paniers.'
        },
        step3: {
            title: 'Partage égal',
            description: 'Mets la même quantité partout pour gagner !'
        }
    }
} as const;

export default manifest;
