const en = {
    title: 'Lompat Katak',
    subtitle: 'Lompat, lompat, lompat!',
    description: 'Pilih nilai tanda yang benar dan buat katak melompat naik.',
    powerups: {
        timeFreeze: 'Bekukan Waktu',
        extraLife: 'Nyawa Ekstra',
        doubleScore: 'Skor Ganda',
    },
    ui: {
        jumpHint: 'Berapa lompatan untuk katak?'
    },
    howToPlay: {
        step1: {
            title: 'Lihat tandanya!',
            description: 'Tentukan jarak lompatan.'
        },
        step2: {
            title: 'Ketuk tombol angka',
            description: 'Temukan dan pilih jawabannya.'
        },
        step3: {
            title: 'Lompat dan mendarat!',
            description: 'Capai tanda yang benar untuk menyelesaikan.'
        }
    }
} as const;

export default en;
