const locale = {
    title: '10フレームたし算',
    subtitle: '10と20をつくろう',
    description: '点を変えて空欄の数を見つけよう。',
    question: '空欄に入る数はどれかな？',
    powerups: {
        timeFreeze: '時間停止',
        extraLife: 'ライフ追加',
        doubleScore: 'スコア2倍'
    },
    ui: {
        tapRedHint: '赤い点をタップしよう！'
    },
    howToPlay: {
        step1: { title: '目標を確認', description: '空欄の数を見つけよう。' },
        step2: { title: '点を切り替え', description: '赤を青に変えよう。' },
        step3: { title: '答えを選ぶ', description: '正しい数を選ぼう。' }
    }
} as const;

export default locale;
