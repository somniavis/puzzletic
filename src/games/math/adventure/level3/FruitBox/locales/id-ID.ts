const en = {
    title: 'Kotak Buah',
    subtitle: 'Kemas bundel yang sama!',
    description: 'Masukkan bundel buah yang sama ke setiap kotak.',
    howToPlay: {
        step1: {
            title: 'Lihat Pesanan',
            description: 'Periksa kartu pesanan terlebih dahulu.'
        },
        step2: {
            title: 'Seret Bundel',
            description: 'Seret bundel ke dalam kotak.'
        },
        step3: {
            title: 'Samakan Isi',
            description: 'Buat semua susunan kotak sama.'
        }
    },
    formulaHint: 'Tolong isi semua kotak!',
    ui: {
        orderGroupsUnit: ' grup',
        orderEachUnit: ' per grup',
        dragToBoxHint: 'Seret buah ke kotak!'
    },
    feedback: {
        fillAll: 'Isi semua kotak dulu.',
        retry: 'Coba lagi pesanan yang sama.'
    }
} as const;

export default en;
