const manifest = {
    title: 'Kloning Sel',
    subtitle: 'Kuasai perkalian 2 dan 4!',
    description: 'Game perkalian untuk melatih tabel 2 dan 4.',
    powerups: {
        timeFreeze: 'Bekukan',
        extraLife: 'Nyawa',
        doubleScore: 'Ganda'
    },
    ui: {
        dragDropHint: 'Seret & lepas ke sel'
    },
    howToPlay: {
        step1: {
            title: 'Hitung sel',
            description: 'Hitung sel di tengah.'
        },
        step2: {
            title: 'Cek target',
            description: 'Lihat warna dan angka.'
        },
        step3: {
            title: 'Seret untuk kloning',
            description: 'Lepas reagen dan cocokkan.'
        }
    }
} as const;

export default manifest;
