const en = {
    title: 'Serangan Troll',
    subtitle: 'Pertahankan Kastel!',
    description: 'Hentikan troll dengan peluru meriam yang tepat.',
    howToPlay: {
        step1: {
            title: 'Troll Datang',
            description: 'Perhatikan persamaannya.'
        },
        step2: {
            title: 'Muat Bom',
            description: 'Pilih bom angka yang benar.'
        },
        step3: {
            title: 'Tembak!',
            description: 'Seret ke meriam lalu tembak.'
        }
    },
    ui: {
        dragHint: 'Seret bom ke meriam!',
        dragOverlayHint: 'Seret bom ke meriam!',
        dropHint: 'Lepas di sini untuk menembak!',
        underHit: 'Terlalu lemah! Troll sedang menyerbu.',
        overHit: 'Terlalu kuat! Troll menahannya.',
        correctHit: 'Kena tepat! Troll dikalahkan.',
        castleHit: 'Troll mencapai kastel! Kamu kehilangan 1 nyawa.'
    }
} as const;

export default en;
