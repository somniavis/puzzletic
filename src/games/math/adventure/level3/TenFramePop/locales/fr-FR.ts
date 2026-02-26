const fr = {
    title: '10-Frame Pop',
    subtitle: 'Maitrise la table de 9',
    description: 'Eclate la derniere bulle et complete la table de 9.',
    howToPlay: {
        step1: { title: 'Eclate la derniere', description: 'Touche seulement la derniere bulle de chaque ligne.' },
        step2: { title: 'Evite les erreurs', description: 'Une mauvaise bulle retire 1 vie.' },
        step3: { title: 'Choisis la reponse', description: 'Choisis le bon resultat.' }
    },
    ui: {
        popHint: 'Eclate les dernieres bulles!'
    }
} as const;

export default fr;
