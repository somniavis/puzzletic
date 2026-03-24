const id = {
    title: 'Menyeberangi Sungai',
    subtitle: 'Cari batu pijakan yang benar',
    description: 'Pilih hanya batu pembagian yang sesuai dengan angka target dan menyeberang sampai tujuan.',
    powerups: {
        timeFreeze: 'Bekukan waktu',
        extraLife: 'Nyawa ekstra',
        doubleScore: 'Skor ganda'
    },
    ui: {
        placeholderTitle: 'Seberangi sungai dengan ekspresi yang benar',
        placeholderBody: 'Pilih hanya batu pembagian yang cocok dengan angka target dan bergerak dari awal ke tujuan.',
        targetLabel: 'Target',
        startLabel: 'Mulai',
        goalLabel: 'Tujuan',
        boardAriaLabel: 'Papan Menyeberangi Sungai',
        moveHint: 'Satu batu setiap langkah!'
    },
    howToPlay: {
        step1: { title: 'Lihat target', description: 'Cari nilai yang sama' },
        step2: { title: 'Maju satu langkah', description: 'Hanya batu dekat' },
        step3: { title: 'Capai tujuan', description: 'Salah, jatuh' }
    }
} as const;

export default id;
