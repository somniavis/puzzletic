const manifest = {
    title: "Coupe-fruits",
    subtitle: "Découpe la bonne réponse !",
    description: "Calcule le nombre manquant et coupe le fruit pour préparer un en-cas sain.",
    howToPlay: {
        step1: {
            title: "Combien de parts ?",
            description: "Choisis d’abord le nombre."
        },
        step2: {
            title: "Choisis le couteau",
            description: "Prends le bon numéro."
        },
        step3: {
            title: "Coupe le fruit",
            description: "Coupe pour valider."
        }
    },
    ui: {
        dragSliceHint: 'Fais glisser le couteau pour couper !'
    },
    powerups: {
        freeze: "Gel du temps",
        life: "Vie supplémentaire",
        double: "Score x2"
    }
};

export default manifest;
