const manifest = {
    title: 'Neon Matrix',
    subtitle: 'Kuasai perkalian 8!',
    description: 'Puzzle cepat untuk menguasai pola digit akhir perkalian 8.',
    powerups: {
        timeFreeze: 'Bekukan',
        extraLife: 'Nyawa',
        doubleScore: 'Ganda'
    },
    ui: {
        tapHint: 'Ketuk 8, 6, 4, 2, atau 0 untuk mengisi.',
        dragDropHint: 'Ketuk 8, 6, 4, 2, atau 0 untuk mengisi.',
        patternHint: 'Ingat 8-6-4-2-0!',
        signTitle: 'Kode Rahasia Perkalian 8',
        signCode: '8-6-4-2-0',
        cellLabel: '8x{{index}}',
        cellAriaLabel: 'Sel matriks {{index}}',
        modePattern: 'Jalur Pola',
        modeVertical: 'Cocok Vertikal'
    },
    howToPlay: {
        step1: {
            title: '8-6-4-2-0!',
            description: 'Ingat polanya.'
        },
        step2: {
            title: 'Masukkan digit',
            description: 'Ketuk angka yang tepat.'
        },
        step3: {
            title: 'Set selesai',
            description: 'Naikkan combo!'
        }
    }
} as const;

export default manifest;
