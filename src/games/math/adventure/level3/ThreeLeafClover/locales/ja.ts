const ja = {
    title: '三つ葉クローバー',
    subtitle: '3の段マスター！',
    description: 'クローバーを咲かせて3の段をマスターしよう！',
    question: '三つ葉クローバーの葉は全部でいくつ？',
    powerups: {
        timeFreeze: '時間停止',
        extraLife: 'ライフ追加',
        doubleScore: 'スコア2倍'
    },
    a11y: {
        ladybug1: 'てんとう虫1',
        ladybug2: 'てんとう虫2',
        beetle: 'かぶと虫',
        cloverDot: 'クローバーの位置 {{index}}'
    },
    ui: {
        tapEverySpotFirst: 'tap every spot first.'
    },
    howToPlay: {
        step1: { title: '問題を確認', description: '☘️ 3×nを見よう。' },
        step2: { title: 'クローバーを咲かせる', description: 'すべての点をタップ。' },
        step3: { title: '答えを選ぶ', description: '正しい数字を選ぼう。' }
    }
} as const;

export default ja;
