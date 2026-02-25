const en = {
    title: 'Chasseur de constellations',
    subtitle: 'Allume les étoiles !',
    description: 'Résous des multiplications à 1 chiffre pour compléter chaque constellation.',
    howToPlay: {
        step1: {
            title: "Vérifie l'équation",
            description: 'Résous le calcul.'
        },
        step2: {
            title: "Allume l'étoile",
            description: "Touchez la bonne étoile."
        },
        step3: {
            title: "Complète l'ensemble",
            description: 'Allume toutes les étoiles puis valide.'
        }
    },
    difficulty: {
        low: 'Facile',
        mid: 'Moyen',
        high: 'Difficile',
        top: 'Très difficile'
    },
    sets: {
        northDipper: 'Grande Ourse',
        january: 'Janvier · Capricorne',
        february: 'Février · Verseau',
        march: 'Mars · Poissons',
        april: 'Avril · Bélier',
        may: 'Mai · Taureau',
        june: 'Juin · Gémeaux',
        july: 'Juillet · Cancer',
        august: 'Août · Lion',
        september: 'Septembre · Vierge',
        october: 'Octobre · Balance',
        november: 'Novembre · Scorpion',
        december: 'Décembre · Sagittaire'
    },
    ui: {
        setLabel: 'Set {{current}}/{{total}}',
        clickCorrectStarHint: "Touchez la bonne étoile !",
        solveGuide: 'Trouve la bonne réponse étoile.',
        solveGuideSub: 'Une erreur coûte 1 vie. Une bonne réponse allume l’étoile.',
        clearedTitle: '{{name}} terminé !',
        clearedSub: 'Appuie sur valider pour passer au set suivant.'
    }
} as const;

export default en;
