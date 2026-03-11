const idId = {
    title: 'Toko Donat',
    subtitle: 'Kemas donat sama rata!',
    description: 'ㅇㅇㅇ',
    powerups: {
        timeFreeze: 'Freeze',
        extraLife: 'Life',
        doubleScore: 'Double'
    },
    ui: {
        mission: 'Kemas donat per {{count}} buah.',
        dragDropHint: 'Ketuk untuk menempatkan kotak donat.'
    },
    howToPlay: {
        step1: { title: 'Hitung donat', description: 'Hitung donat di rak.' },
        step2: { title: 'Letakkan kotak dulu', description: 'Ketuk slot titik-titik untuk meletakkan kotak.' },
        step3: { title: 'Kemas sama rata', description: 'Isi semua kotak dengan jumlah sama.' }
    }
} as const;

export default idId;
