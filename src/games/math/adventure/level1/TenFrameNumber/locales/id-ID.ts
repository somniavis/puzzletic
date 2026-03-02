const manifest = {
    title: 'Angka 10 Frame',
    subtitle: 'Hitung cepat, berpikir dalam puluhan',
    description: 'ㅇㅇㅇ',
    powerups: {
        timeFreeze: 'ㅇㅇㅇ',
        extraLife: 'ㅇㅇㅇ',
        doubleScore: 'ㅇㅇㅇ'
    },
    ui: {
        placeholder: 'ㅇㅇㅇ',
        howManyHint: 'berapa banyak?'
    },
    howToPlay: {
        step1: { title: 'Lihat kartunya', description: 'Hitung titik biru atau merah.' },
        step2: { title: 'Pilih angkanya', description: 'Ketuk jawaban yang benar.' },
        step3: { title: 'Selesaikan set', description: 'Bangun streak dan dapatkan power-up.' }
    }
} as const;

export default manifest;
