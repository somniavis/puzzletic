const manifest = {
    title: 'Nourrir Jello',
    subtitle: 'Jello a faim !',
    description: 'Fais glisser les fruits vers Jello et résous la mission de soustraction.',
    howToPlay: {
        step1: {
            title: 'Choisis les fruits',
            description: 'Fais-les glisser depuis le plateau'
        },
        step2: {
            title: 'Nourris Jello',
            description: 'Dépose sur Jello en mouvement'
        },
        step3: {
            title: 'Appuie sur Vérifier',
            description: 'Bonne réponse = question suivante'
        }
    },
    labels: {
        fed: 'Donnés',
        remaining: 'Restants'
    },
    ui: {
        dragFeedHint: 'Glisse la nourriture pour nourrir !'
    },
    question: '8 - 3 = ?'
};

export default manifest;
