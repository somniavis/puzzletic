const id = {
    title: 'Pop 10 Kotak',
    subtitle: 'Kuasai perkalian 9',
    description: 'Pecahkan gelembung terakhir dan selesaikan perkalian 9.',
    howToPlay: {
        step1: { title: 'Pecahkan gelembung akhir', description: 'Sentuh hanya gelembung terakhir di tiap baris.' },
        step2: { title: 'Hindari salah', description: 'Gelembung salah mengurangi 1 nyawa.' },
        step3: { title: 'Pilih jawaban', description: 'Pilih hasil yang benar.' }
    },
    ui: {
        popHint: 'Pecahkan gelembung terakhir!'
    }
} as const;

export default id;
