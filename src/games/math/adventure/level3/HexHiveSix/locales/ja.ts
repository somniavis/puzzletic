const ja = {
    title: '六角ハチの巣',
    subtitle: '6の段マスター！',
    description: 'ハチの巣を埋めて6の段をマスターしよう！',
    question: '辺は全部でいくつ？',
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
        step1: { title: '問題を確認', description: '⬢ 6×nを見よう。' },
        step2: { title: '巣を埋める', description: '六角形をn回タップ。' },
        step3: { title: '答えを選ぶ', description: '辺の合計を選ぼう。' }
    }
} as const;

export default ja;
