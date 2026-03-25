const id = {
    title: 'Pizza Pizza',
    subtitle: 'Berapa untuk tiap teman?',
    description: 'ㅇㅇㅇ',
    powerups: {
        timeFreeze: 'Bekukan waktu',
        extraLife: 'Nyawa ekstra',
        doubleScore: 'Skor ganda'
    },
    ui: {
        boardAriaLabel: 'Papan Pizza Pizza',
        bubbleText: `Ayo bagi pizza {{pizzaType}} {{sliceCount}} potong untuk {{friendCount}} teman!`,
        answerChoicesAriaLabel: 'pilihan jawaban',
        choiceLabel: 'Masing-masing'
    },
    pizzaTypes: {
        pepperoni: 'pepperoni',
        cheese: 'keju',
        veggie: 'sayur'
    },
    howToPlay: {
        step1: { title: 'Lihat pizzanya', description: 'Pikirkan cara membaginya' },
        step2: { title: 'Pilih angka', description: 'Berapa untuk tiap teman' },
        step3: { title: 'Periksa bagiannya', description: 'Menang jika sama rata' }
    }
} as const;

export default id;
