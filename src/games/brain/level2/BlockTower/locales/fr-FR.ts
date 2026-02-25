const en = {
    title: 'Tour de blocs',
    subtitle: 'Empile malin, reste stable !',
    description: 'Dépose des blocs égaux sur la grille et construis une tour stable.',
    howToPlay: {
        step1: {
            title: 'Touchez pour déposer',
            description: 'Touchez pour déposer le bloc.'
        },
        step2: {
            title: "Garde l'équilibre",
            description: 'Maintiens la tour stable.'
        },
        step3: {
            title: 'Monte plus haut',
            description: 'Atteins le sommet pour réussir.'
        }
    },
    ui: {
        target: 'Cible',
        bundles: 'Paquets',
        bundleCard: 'Bloc actuel',
        balanceStatus: 'Équilibre',
        nextBlock: 'Bloc suivant',
        good: 'Bon',
        normal: 'Moyen',
        risk: 'Risque',
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
