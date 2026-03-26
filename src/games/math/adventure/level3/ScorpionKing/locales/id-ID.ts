const id = {
    title: 'Raja Kalajengking',
    subtitle: 'Berapa Kali Serang?',
    description: 'ㅇㅇㅇ',
    powerups: {
        timeFreeze: 'Waktu beku',
        extraLife: 'Nyawa ekstra',
        doubleScore: 'Skor ganda'
    },
    ui: {
        boardAriaLabel: 'Papan Scorpion King',
        hitsHint: 'Berapa Kali Serang?'
    },
    howToPlay: {
        step1: { title: 'Lihat HP dan serangan', description: 'Pikirkan jumlah serangannya' },
        step2: { title: 'Pilih jumlah serangan', description: 'Pilih tombol yang benar' },
        step3: { title: 'Kalahkan kalajengking lebih dulu', description: 'Menang sebelum HP Jello habis' }
    }
} as const;

export default id;
