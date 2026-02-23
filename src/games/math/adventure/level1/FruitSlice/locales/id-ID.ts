const manifest = {
    title: 'Iris Buah',
    subtitle: 'Iris Jawabannya!',
    description: 'Hitung angka yang hilang lalu iris buah untuk membuat camilan sehat.',
    howToPlay: {
        step1: {
            title: 'Berapa Irisan?',
            description: 'Tentukan angkanya dulu.'
        },
        step2: {
            title: 'Pilih Pisau',
            description: 'Pilih angka yang sesuai.'
        },
        step3: {
            title: 'Iris Buah',
            description: 'Iris untuk mengirim jawaban.'
        }
    },
    ui: {
        dragSliceHint: 'Seret pisau untuk mengiris!'
    },
    powerups: {
        freeze: 'Bekukan Waktu',
        life: 'Nyawa Ekstra',
        double: 'Skor 2x'
    }
};

export default manifest;
