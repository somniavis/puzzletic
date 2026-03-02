const manifest = {
    title: 'Nombre en 10 cases',
    subtitle: 'Compte vite, pense en dizaines',
    description: 'ㅇㅇㅇ',
    powerups: {
        timeFreeze: 'ㅇㅇㅇ',
        extraLife: 'ㅇㅇㅇ',
        doubleScore: 'ㅇㅇㅇ'
    },
    ui: {
        placeholder: 'ㅇㅇㅇ',
        howManyHint: 'combien ?'
    },
    howToPlay: {
        step1: { title: 'Regarde les cartes', description: 'Compte les points bleus ou rouges.' },
        step2: { title: 'Choisis le nombre', description: 'Appuie sur la bonne réponse.' },
        step3: { title: 'Termine des séries', description: 'Enchaîne les réussites et gagne des bonus.' }
    }
} as const;

export default manifest;
