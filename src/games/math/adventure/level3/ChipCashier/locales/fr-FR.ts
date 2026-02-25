const en = {
    title: 'Caissier des pièces',
    subtitle: 'Maîtrise 5 et 10 !',
    description: 'Choisis le bon nombre de paquets pour atteindre le total demandé.',
    powerups: {
        timeFreeze: 'Gel',
        extraLife: 'Vie',
        doubleScore: 'x2'
    },
    ui: {
        customerRequest: 'Prépare un total de {{target}} pièces !',
        coinLabel: 'pièce',
        bundleAria: 'Paquet de {{size}} pièces',
        bundle5: 'Paquet de 5',
        bundle10: 'Paquet de 10',
        chooseCount: 'Choisis les paquets',
        dropZone: 'Zone des pièces'
    },
    howToPlay: {
        step1: {
            title: 'Le client arrive',
            description: 'Vérifie le total demandé.'
        },
        step2: {
            title: 'Vérifie le type',
            description: 'Paquet de 5 ou de 10.'
        },
        step3: {
            title: 'Choisis la quantité',
            description: 'Touchez la bonne réponse.'
        }
    }
} as const;

export default en;
