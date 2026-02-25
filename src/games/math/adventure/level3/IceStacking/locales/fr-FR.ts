const en = {
    title: 'Empilement de glace',
    subtitle: 'Empile sans tout faire tomber !',
    description: 'Dépose des paquets de glace égaux sur la grille et construis une tour stable.',
    howToPlay: {
        step1: {
            title: 'Vérifie la mission',
            description: "Regarde l'objectif en haut."
        },
        step2: {
            title: 'Touchez pour déposer',
            description: 'Touchez pour déposer le paquet.'
        },
        step3: {
            title: 'Garde l’équilibre',
            description: 'Empile au centre pour réussir.'
        }
    },
    ui: {
        target: 'Cible',
        bundles: 'Paquets',
        bundleCard: 'Paquet de glace actuel',
        clickDropHint: 'Touchez pour déposer !',
        dropHint: 'Déplace-toi sur la grille puis touche pour déposer',
        defaultGuide: 'Construis une pile stable pour réussir la mission.'
    },
    feedback: {
        success: 'Pile parfaite ! Mission suivante !',
        collapse: 'La pile est tombée ! Réessaie la même mission.'
    }
} as const;

export default en;
