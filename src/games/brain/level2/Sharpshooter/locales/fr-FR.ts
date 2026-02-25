const manifest = {
    title: "Archer d'élite",
    subtitle: 'Touchez la bonne cible !',
    description: "Résous l'équation et tire sur la bonne cible.",
    howToPlay: {
        step1: { title: 'Vérifie la cible', description: 'Regarde le symbole cible.' },
        step2: { title: 'Suis les cibles', description: 'Trouve le symbole correspondant.' },
        step3: { title: 'Tire', description: 'Anneau touché : 10/8/6 (×10).' }
    },
    powerups: {
        freeze: 'Gel du temps',
        life: 'Vie supplémentaire',
        double: 'Score doublé'
    },
    ui: {
        pullShootHint: 'Tire et relâche !',
        targetLabel: 'cible'
    }
};

export default manifest;
