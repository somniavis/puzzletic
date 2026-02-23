const en = {
    title: 'Pencari Konstelasi',
    subtitle: 'Nyalakan bintangnya!',
    description: 'Selesaikan perkalian 1 digit dan lengkapi setiap set konstelasi.',
    howToPlay: {
        step1: {
            title: 'Lihat Persamaan',
            description: 'Selesaikan persamaannya.'
        },
        step2: {
            title: 'Nyalakan Bintang',
            description: 'Ketuk bintang yang benar.'
        },
        step3: {
            title: 'Lengkapi Set',
            description: 'Nyalakan semua bintang, lalu cek.'
        }
    },
    difficulty: {
        low: 'Mudah',
        mid: 'Sedang',
        high: 'Sulit',
        top: 'Sangat Sulit'
    },
    sets: {
        northDipper: 'Biduk Besar',
        january: 'Januari · Capricorn',
        february: 'Februari · Aquarius',
        march: 'Maret · Pisces',
        april: 'April · Aries',
        may: 'Mei · Taurus',
        june: 'Juni · Gemini',
        july: 'Juli · Cancer',
        august: 'Agustus · Leo',
        september: 'September · Virgo',
        october: 'Oktober · Libra',
        november: 'November · Scorpio',
        december: 'Desember · Sagittarius'
    },
    ui: {
        setLabel: 'Set {{current}}/{{total}}',
        clickCorrectStarHint: 'Ketuk bintang yang benar!',
        solveGuide: 'Temukan jawaban bintang yang tepat.',
        solveGuideSub: 'Salah ketuk mengurangi 1 nyawa. Ketuk benar menyalakan bintang.',
        clearedTitle: '{{name}} selesai!',
        clearedSub: 'Tekan cek untuk lanjut ke set berikutnya.'
    }
} as const;

export default en;
