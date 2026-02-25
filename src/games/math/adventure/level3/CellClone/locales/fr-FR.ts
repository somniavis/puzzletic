const manifest = {
    title: 'Clonage cellulaire',
    subtitle: 'Maîtrise 2 et 4 !',
    description: 'Un jeu de multiplication pour les tables de 2 et de 4.',
    powerups: {
        timeFreeze: 'Gel',
        extraLife: 'Vie',
        doubleScore: 'x2'
    },
    ui: {
        dragDropHint: 'Glisser-déposer sur les cellules'
    },
    howToPlay: {
        step1: {
            title: 'Compte les cellules',
            description: 'Compte les cellules au centre.'
        },
        step2: {
            title: 'Vérifie la cible',
            description: 'Regarde la couleur et le nombre.'
        },
        step3: {
            title: 'Glisse pour cloner',
            description: 'Dépose le réactif pour correspondre à la cible.'
        }
    }
} as const;

export default manifest;
