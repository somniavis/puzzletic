const ja = {
    title: 'スコーピオンキング',
    subtitle: '何回攻撃する？',
    description: 'ㅇㅇㅇ',
    powerups: {
        timeFreeze: '時間停止',
        extraLife: 'ライフ追加',
        doubleScore: 'スコア2倍'
    },
    ui: {
        boardAriaLabel: 'スコーピオンキングボード',
        hitsHint: '何回攻撃する？'
    },
    howToPlay: {
        step1: { title: 'HPと攻撃力を見よう', description: '何回攻撃するか考えよう' },
        step2: { title: '攻撃回数を選ぼう', description: '正しい回数のボタンを選ぼう' },
        step3: { title: 'サソリを先に倒そう', description: 'ジェロのHPがなくなる前に勝とう' }
    }
} as const;

export default ja;
