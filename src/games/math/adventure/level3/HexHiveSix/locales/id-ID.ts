const id = {
    title: 'Sarang Hexa',
    subtitle: 'jago perkalian 6!',
    description: 'Isi sarang dan kuasai perkalian 6.',
    question: 'Berapa jumlah sisi semuanya?',
    powerups: {
        timeFreeze: 'Bekukan Waktu',
        extraLife: 'Nyawa Tambahan',
        doubleScore: 'Skor Ganda'
    },
    a11y: {
        ladybug1: 'Kepik 1',
        ladybug2: 'Kepik 2',
        beetle: 'Kumbang',
        cloverDot: 'Titik semanggi {{index}}'
    },
    ui: {
        tapEverySpotFirst: 'Ketuk jumlah heksagon yang tepat.'
    },
    howToPlay: {
        step1: { title: 'Cek soal', description: 'Lihat ⬢ 6×n.' },
        step2: { title: 'Isi sarang', description: 'Ketuk heksagon n kali.' },
        step3: { title: 'Pilih jawaban', description: 'Pilih jumlah sisi total.' }
    }
} as const;

export default id;
