const idId = {
    title: 'Chocolate Split',
    subtitle: 'Buat kelompok yang sama',
    description: 'ㅇㅇㅇ',
    powerups: {
        timeFreeze: 'Freeze',
        extraLife: 'Life',
        doubleScore: 'Double'
    },
    ui: {
        divideBy: 'Bagi menjadi',
        confirm: 'Periksa',
        dragCutHint: 'Buat garis, lalu ketuk Periksa!',
        perGroupUnknown: 'Per grup: ?',
        perGroupValue: 'Per grup: {{value}}'
    },
    howToPlay: {
        step1: { title: 'Buat garis', description: 'Garis di antara blok' },
        step2: { title: 'Buat kelompok sama', description: 'Samakan semua kelompok' },
        step3: { title: 'Ketuk Periksa', description: 'Ketuk kalau sudah pas' }
    }
} as const;

export default idId;
