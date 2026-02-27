const id = {
    title: 'Semanggi Tiga Daun',
    subtitle: 'jago perkalian 3!',
    description: 'Tumbuhkan semanggi dan kuasai perkalian 3.',
    question: 'Ada berapa total daun semanggi?',
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
        tapEverySpotFirst: 'tap every spot first.'
    },
    howToPlay: {
        step1: { title: 'Cek soal', description: 'Lihat ☘️ 3×n.' },
        step2: { title: 'Tumbuhkan semanggi', description: 'Ketuk semua titik.' },
        step3: { title: 'Pilih jawaban', description: 'Pilih angka yang benar.' }
    }
} as const;

export default id;
