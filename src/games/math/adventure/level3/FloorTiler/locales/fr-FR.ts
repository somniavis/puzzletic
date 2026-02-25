const en = {
    title: 'Poseur de dalles',
    subtitle: 'Remplis les cases parfaitement !',
    description: "Utilise la largeur et la hauteur pour trouver l'aire et remplir les cases.",
    ui: {
        targetLabel: 'Dalle',
        progress: '{{filled}}/{{total}}',
        dragHint: 'Glisse sur les cases vides pour peindre le rectangle correspondant.',
        dragHintShort: 'Glisse sur les cases vides pour correspondre à la dalle.',
        boardComplete: 'Parfait ! Passage à la salle suivante...'
    },
    howToPlay: {
        step1: {
            title: 'Vérifie la dalle',
            description: 'Observe la taille a × b.'
        },
        step2: {
            title: 'Glisse pour peindre',
            description: 'Glisse sur les cases vides pour correspondre.'
        },
        step3: {
            title: 'Remplis le sol',
            description: 'Remplis toutes les cases pour valider.'
        }
    }
} as const;

export default en;
