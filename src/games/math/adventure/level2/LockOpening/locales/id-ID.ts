const manifest = {
    title: 'Buka Gembok',
    subtitle: 'Temukan kode sandinya!',
    description: 'Pilih dua angka untuk membuat angka target.',
    ui: {
        pickTwo: 'Pilih dua angka',
    },
    powerups: {
        timeFreeze: 'Bekukan Waktu',
        extraLife: 'Nyawa Ekstra',
        doubleScore: 'Skor Ganda',
    },
    howToPlay: {
        step1: {
            title: 'Lihat Target +/-',
            description: 'Perhatikan angka targetnya!',
        },
        step2: {
            title: 'Pilih Dua Angka',
            description: 'Temukan dua angka kodenya!',
        },
        step3: {
            title: 'Buka!',
            description: 'Berhasil! Gembok terbuka!',
        },
    },
} as const;

export default manifest;
