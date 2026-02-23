const en = {
    title: 'Pemasang Lantai',
    subtitle: 'Isi ubin dengan tepat!',
    description: 'Gunakan lebar dan tinggi untuk mencari luas lalu isi ubinnya.',
    ui: {
        targetLabel: 'Ubin',
        progress: '{{filled}}/{{total}}',
        dragHint: 'Seret sel kosong untuk mewarnai persegi panjang yang cocok.',
        dragHintShort: 'Seret sel kosong agar sesuai ubin.',
        boardComplete: 'Bagus! Pindah ke ruangan berikutnya...'
    },
    howToPlay: {
        step1: {
            title: 'Lihat Ubin',
            description: 'Periksa ukuran a × b.'
        },
        step2: {
            title: 'Seret untuk Mewarnai',
            description: 'Seret sel kosong agar cocok.'
        },
        step3: {
            title: 'Isi Lantai',
            description: 'Isi semua sel untuk menyelesaikan.'
        }
    }
} as const;

export default en;
