export default {
    title: 'Penyihir Pemula',
    subtitle: 'Kuasai 0 dan 1!',
    description: 'Pilih sihir lindungi/hapus agar sesuai target.',
    ui: {
        targetLabel: 'Sasaran',
        protectHint: '🛡️ pertahankan semua',
        removeHint: '🕳️ hilangkan semua',
        tapSpellHint: 'Ketuk mantranya!'
    },
    powerups: {
        timeFreeze: 'Bekukan Waktu',
        extraLife: 'Nyawa Ekstra',
        doubleScore: 'Skor Ganda',
    },
    howToPlay: {
        step1: {
            title: 'Dua mantra',
            description: 'Latih kedua mantranya.'
        },
        step2: {
            title: 'x1: Mantra pelindung',
            description: 'Menjaga hewan tetap seperti semula.'
        },
        step3: {
            title: 'x0: Mantra penghapus',
            description: 'Mengirim hewan ke lubang hitam.'
        }
    }
} as const;
