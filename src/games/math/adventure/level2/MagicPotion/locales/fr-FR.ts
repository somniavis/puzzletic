const manifest = {
    title: 'Magic Potion',
    'title-lv1': 'Magic Potion (Lv1)',
    'title-lv2': 'Magic Potion (Lv2)',
    subtitle: 'Mélange des ingrédients magiques !',
    description: 'ㅇㅇㅇ',
    ui: {
        placeholder: 'ㅇㅇㅇ',
        makeLabel: 'MAKE',
        dragHint: 'Drag and drop 3 ingredients!',
        correct: 'CORRECT!',
        wrong: 'MISS!',
    },
    powerups: {
        timeFreeze: 'Time Freeze',
        extraLife: 'Extra Life',
        doubleScore: 'Double Score',
    },
    howToPlay: {
        step1: {
            title: 'Vérifie la cible',
            description: 'Regarde d’abord le nombre cible.',
        },
        step2: {
            title: 'Choisis 3 ingrédients',
            description: 'Mets nombre, signe, nombre.',
        },
        step3: {
            title: 'Complète la réponse',
            description: 'Si ça égale la cible, c’est juste.',
        },
    },
} as const;

export default manifest;
