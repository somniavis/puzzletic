const en = {
    title: 'Tumpuk Es',
    subtitle: 'Tumpuk hati-hati agar tidak roboh!',
    description: 'Jatuhkan bundel es yang sama ke grid dan bangun menara yang stabil.',
    howToPlay: {
        step1: {
            title: 'Lihat Misi',
            description: 'Periksa misi di bagian atas.'
        },
        step2: {
            title: 'Ketuk untuk Menjatuhkan',
            description: 'Ketuk untuk menjatuhkan bundel.'
        },
        step3: {
            title: 'Jaga Keseimbangan',
            description: 'Tumpuk di tengah untuk menyelesaikan.'
        }
    },
    ui: {
        target: 'Sasaran',
        bundles: 'Bundel',
        bundleCard: 'Bundel Es Saat Ini',
        clickDropHint: 'Ketuk untuk menjatuhkan!',
        dropHint: 'Gerakkan di grid lalu ketuk untuk menjatuhkan',
        defaultGuide: 'Bangun tumpukan stabil untuk menyelesaikan misi.'
    },
    feedback: {
        success: 'Tumpukan sempurna! Misi berikutnya!',
        collapse: 'Tumpukan roboh! Coba lagi misi yang sama.'
    }
} as const;

export default en;
