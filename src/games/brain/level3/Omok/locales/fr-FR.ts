const omokEn = {
    title: 'Omok',
    subtitle: 'Cinq à la suite',
    description: "Aligne 5 pierres pour battre l'IA !",
    howToPlay: {
        step1: {
            title: 'Place une pierre',
            description: 'Touchez une intersection pour placer votre pierre.'
        },
        step2: {
            title: "Bloque l'IA",
            description: "Empêche la ligne de l'IA d'atteindre 5."
        },
        step3: {
            title: 'Fais 5 à la suite',
            description: 'Aligne 5 pierres en premier pour gagner.'
        }
    },
    status: {
        playerTurn: 'À votre tour',
        aiTurn: 'IA en réflexion...',
        win: 'Vous avez gagné !',
        lose: 'Vous avez perdu...',
        draw: 'Égalité !'
    },
    ui: {
        guideHint: "Faites 5 à la suite avant l'IA !"
    }
};

export default omokEn;
