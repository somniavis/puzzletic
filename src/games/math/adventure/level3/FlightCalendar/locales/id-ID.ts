import base from './base';

const id = {
    ...base,
    title: 'Kalender Penerbangan',
    subtitle: 'Master 7',
    question: 'Berapa hari lagi sampai berangkat?',
    howToPlay: {
        ...base.howToPlay,
        step2: { title: 'Isi Kalender', description: 'Ketuk Minggu untuk isi 1 minggu.' },
        step3: { title: 'Pilih Jawaban', description: 'Berapa hari tersisa?' }
    },
    ui: {
        tapEverySpotFirst: 'Ketuk jumlah hari Minggu yang tepat.'
    },
    weekdays: {
        mon: 'Sen',
        tue: 'Sel',
        wed: 'Rab',
        thu: 'Kam',
        fri: 'Jum',
        sat: 'Sab',
        sun: 'Min'
    },
    powerups: {
        timeFreeze: 'Bekukan Waktu',
        extraLife: 'Nyawa Tambahan',
        doubleScore: 'Skor Ganda'
    },
    a11y: {
        ladybug1: 'Kepik 1',
        ladybug2: 'Kepik 2',
        beetle: 'Kumbang',
        cloverDot: 'Titik semanggi {{index}}'
    }
} as const;

export default id;
