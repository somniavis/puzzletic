const manifest = {
    title: 'Beri Makan Jello',
    subtitle: 'Jello Lapar!',
    description: 'Seret buah ke Jello dan selesaikan misi penguranganmu.',
    howToPlay: {
        step1: {
            title: 'Pilih Buah',
            description: 'Seret dari papan awal'
        },
        step2: {
            title: 'Beri Makan Jello',
            description: 'Lepas pada Jello yang bergerak'
        },
        step3: {
            title: 'Ketuk Cek',
            description: 'Jika benar lanjut ke soal berikutnya'
        }
    },
    labels: {
        fed: 'Sudah Diberi',
        remaining: 'Sisa'
    },
    ui: {
        dragFeedHint: 'Seret makanan untuk memberi makan!'
    },
    question: '8 - 3 = ?'
};

export default manifest;
