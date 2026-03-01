const ja = {
    title: 'ネオンマトリクス',
    subtitle: '8の段マスター',
    description: '8の段の一の位パターンを鍛えるスピードパズル。',
    powerups: {
        timeFreeze: '時間停止',
        extraLife: 'ライフ追加',
        doubleScore: 'スコア2倍'
    },
    ui: {
        tapHint: '空欄に合う 8・6・4・2・0 をタップ。',
        dragDropHint: '空欄に合う 8・6・4・2・0 をタップ。',
        patternHint: '8-6-4-2-0 を覚えよう！',
        signTitle: '8の段シークレットコード',
        signCode: '8-6-4-2-0',
        cellLabel: '8x{{index}}',
        cellAriaLabel: 'マトリクスセル {{index}}',
        modePattern: 'パターンレーン',
        modeVertical: '上下マッチ'
    },
    howToPlay: {
        step1: {
            title: '8-6-4-2-0!',
            description: 'パターンを覚えよう。'
        },
        step2: {
            title: '数字入力',
            description: '正しい数字をタップ。'
        },
        step3: {
            title: 'セットクリア',
            description: 'コンボアップ！'
        }
    }
} as const;

export default ja;
