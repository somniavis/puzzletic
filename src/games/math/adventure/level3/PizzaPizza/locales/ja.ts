const ja = {
    title: 'ピザピザ',
    subtitle: 'ひとりぶんは いくつかな？',
    description: 'ㅇㅇㅇ',
    powerups: {
        timeFreeze: '時間ストップ',
        extraLife: 'ライフ追加',
        doubleScore: 'スコア2倍'
    },
    ui: {
        boardAriaLabel: 'ピザピザボード',
        bubbleText: '{{pizzaType}}ピザ{{sliceCount}}切れを{{friendCount}}人で分けよう！',
        answerChoicesAriaLabel: 'こたえのせんたくし',
        choiceLabel: 'それ\nぞれ'
    },
    pizzaTypes: {
        pepperoni: 'ペパロニ',
        cheese: 'チーズ',
        veggie: '野菜'
    },
    howToPlay: {
        step1: { title: 'ピザを見よう', description: 'どう分けるか考えよう' },
        step2: { title: '数字をえらぼう', description: 'ひとりぶんはいくつかな' },
        step3: { title: '分け方をたしかめよう', description: '同じならせいかい' }
    }
} as const;

export default ja;
