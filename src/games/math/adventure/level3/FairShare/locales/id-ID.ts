const manifest = {
    title: 'Fair Share',
    subtitle: 'Bagi dengan jumlah yang sama!',
    description: 'Game perkalian untuk melatih tabel 2 dan 4.',
    powerups: {
        timeFreeze: 'Bekukan',
        extraLife: 'Nyawa',
        doubleScore: 'Ganda'
    },
    ui: {
        dragDropHint: 'Seret & lepas ke sel',
        mission: 'Bagikan sama rata kepada {{count}} teman.'
    },
    howToPlay: {
        step1: {
            title: 'Hitung temanmu',
            description: 'Hitung ada berapa teman.'
        },
        step2: {
            title: 'Seret buahnya',
            description: 'Seret buah ke keranjang.'
        },
        step3: {
            title: 'Bagi sama rata',
            description: 'Samakan semua keranjang untuk menang!'
        }
    }
} as const;

export default manifest;
