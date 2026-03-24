const ja = {
    title: '川わたり',
    subtitle: '正しい飛び石さがし',
    description: '目標の数になるわり算の飛び石だけをえらんで、スタートからゴールまでわたりましょう。',
    powerups: {
        timeFreeze: '時間ストップ',
        extraLife: 'ライフ追加',
        doubleScore: 'スコア2倍'
    },
    ui: {
        placeholderTitle: '正しい式で川をわたろう',
        placeholderBody: '目標の数になるわり算の飛び石だけをえらび、スタートからゴールへ進みます。',
        targetLabel: '目標',
        startLabel: 'スタート',
        goalLabel: 'ゴール',
        boardAriaLabel: '川わたりボード',
        moveHint: '飛び石は一回で一マスずつ！'
    },
    howToPlay: {
        step1: { title: '目標を見よう', description: '同じ数をさがそう' },
        step2: { title: '一歩ずつ進もう', description: '近い石だけ' },
        step3: { title: 'ゴールへ行こう', description: 'まちがうと落ちる' }
    }
} as const;

export default ja;
