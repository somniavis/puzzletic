const ja = {
    title: '細胞クローン',
    subtitle: '2の段・4の段マスター',
    description: '2の段と4の段を練習するゲームです。',
    powerups: {
        timeFreeze: '時間停止',
        extraLife: 'ライフ追加',
        doubleScore: 'スコア2倍'
    },
    ui: {
        dragDropHint: '細胞へドラッグ＆ドロップ'
    },
    howToPlay: {
        step1: {
            title: '細胞の数を確認',
            description: '中央の細胞を数えよう。'
        },
        step2: {
            title: '目標を確認',
            description: '色と数字を見よう。'
        },
        step3: {
            title: 'ドラッグで複製',
            description: '試薬を置いて答えを合わせよう。'
        }
    }
} as const;

export default ja;
