export default {
    lv1: {
        title: 'Multiplication arrière 1',
        subtitle: '1-digit x 1-digit',
    },
    lv2: {
        title: 'Multiplication arrière 2',
        subtitle: '2-digit x 1-digit',
    },
    lv3: {
        title: 'Multiplication arrière 3',
        subtitle: '3-digit x 1-digit',
    },
    lv4: {
        title: 'Multiplication arrière 4',
        subtitle: '2-digit x 2-digit',
        desc: 'Résous avec la méthode croisée.'
    },
    description: 'Calcule de droite à gauche avec les produits partiels !',
    powerups: {
        timeFreeze: 'Gel du temps',
        extraLife: 'Vie supplémentaire',
        doubleScore: 'Score doublé',
    },
    howToPlay: {
        step1: { title: 'Unités' },
        step2: { title: 'Dizaines' },
        step3: { title: 'Total' },
        step3_hundreds: { title: 'Centaines' },
        step4: { title: 'Total' },
        // Lv3
        step3_cross1: { title: 'Étape croisée 1' },
        step4_cross2: { title: 'Étape croisée 2' },
        step5: { title: 'Total' },
        answer: { title: 'Réponse' }
    },
    hint: {
        step1: "Multiplie d'abord les unités (1).",
        step2: 'Puis multiplie les dizaines (10).',
        step3: 'Additionne les résultats !',
        step3_hundreds: 'Ensuite, multiplie les centaines (100).',
        step4: 'Additionne les résultats !',
        // Lv3 Hints
        step1_lv3: "Multiplie d'abord unités x unités.",
        step2_lv3: 'Puis dizaines x dizaines.',
        step3_cross1: 'Dizaines du haut x unités du bas (↘)',
        step4_cross2: 'Unités du haut x dizaines du bas (↙)',
        step5: 'Fais la somme de tous les produits partiels !',
        answer: 'Saisis le résultat.'
    }
};
