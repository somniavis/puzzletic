const manifest = {
    title: 'Magic Potion',
    subtitle: 'Campur Bahan Ajaib!',
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
            title: 'Cek Target',
            description: 'Lihat dulu angka targetnya.',
        },
        step2: {
            title: 'Pilih 3 Bahan',
            description: 'Masukkan angka, tanda, angka.',
        },
        step3: {
            title: 'Selesaikan Jawaban',
            description: 'Kalau sama target, benar.',
        },
    },
} as const;

export default manifest;
