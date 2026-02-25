const en = {
    title: 'Boîte de fruits',
    subtitle: 'Fais des paquets égaux !',
    description: 'Place les mêmes paquets de fruits dans chaque boîte.',
    howToPlay: {
        step1: {
            title: 'Vérifie la commande',
            description: 'Regarde d’abord la carte de commande.'
        },
        step2: {
            title: 'Glisse les paquets',
            description: 'Glisse les paquets dans les boîtes.'
        },
        step3: {
            title: 'Rends-les identiques',
            description: 'Fais la même configuration dans toutes les boîtes.'
        }
    },
    formulaHint: 'Merci de remplir toutes les boîtes !',
    ui: {
        orderGroupsUnit: ' groupes',
        orderEachUnit: ' chacun',
        dragToBoxHint: 'Glisse les fruits dans les boîtes !'
    },
    feedback: {
        fillAll: "Remplis d'abord toutes les boîtes.",
        retry: 'Réessaie avec la même commande.'
    }
} as const;

export default en;
