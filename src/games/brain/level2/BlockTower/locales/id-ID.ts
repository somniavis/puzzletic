const en = {
    title: 'Menara Blok',
    subtitle: 'Tumpuk cerdas, tetap seimbang!',
    description: 'Jatuhkan blok yang sama ke grid dan bangun menara yang stabil.',
    howToPlay: {
        step1: {
            title: 'Ketuk untuk Menjatuhkan',
            description: 'Ketuk untuk menjatuhkan blok.'
        },
        step2: {
            title: 'Jaga Keseimbangan',
            description: 'Jaga menara tetap seimbang.'
        },
        step3: {
            title: 'Bangun Lebih Tinggi',
            description: 'Capai puncak untuk menyelesaikan.'
        }
    },
    ui: {
        target: 'Sasaran',
        bundles: 'Bundel',
        bundleCard: 'Bundel Es Saat Ini',
        balanceStatus: 'Keseimbangan',
        nextBlock: 'Blok Berikutnya',
        good: 'Bagus',
        normal: 'Normal',
        risk: 'Berisiko',
        clickDropHint: 'Ketuk untuk menjatuhkan!',
        dropHint: 'Gerakkan di grid lalu ketuk untuk menjatuhkan',
        defaultGuide: 'Bangun tumpukan stabil untuk menyelesaikan misi.'
    },
    feedback: {
        success: 'Tumpukan sempurna! Lanjut misi berikutnya!',
        collapse: 'Tumpukan runtuh! Coba lagi misi yang sama.'
    }
} as const;

export default en;
