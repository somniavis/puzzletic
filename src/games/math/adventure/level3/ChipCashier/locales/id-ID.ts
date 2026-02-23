const en = {
    title: 'Kasir Koin',
    subtitle: 'Kuasai 5 dan 10!',
    description: 'Pilih jumlah bundel agar sesuai target koin.',
    powerups: {
        timeFreeze: 'Bekukan',
        extraLife: 'Nyawa',
        doubleScore: 'Ganda'
    },
    ui: {
        customerRequest: 'Tolong siapkan total {{target}} koin!',
        coinLabel: 'koin',
        bundleAria: 'bundel {{size}} koin',
        bundle5: 'Bundel 5',
        bundle10: 'Bundel 10',
        chooseCount: 'Pilih bundel',
        dropZone: 'Kotak Koin'
    },
    howToPlay: {
        step1: {
            title: 'Pelanggan Datang',
            description: 'Periksa target koin.'
        },
        step2: {
            title: 'Lihat Jenis Koin',
            description: 'Periksa 5 atau 10.'
        },
        step3: {
            title: 'Pilih Jumlah',
            description: 'Ketuk jumlah yang benar.'
        }
    }
} as const;

export default en;
