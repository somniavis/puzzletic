const ja = {
    title: 'フェアシェア',
    subtitle: '同じ数ずつ分けよう！',
    description: '2の段と4の段を練習するゲームです。',
    powerups: {
        timeFreeze: '時間停止',
        extraLife: 'ライフ追加',
        doubleScore: 'スコア2倍'
    },
    ui: {
        dragDropHint: '細胞へドラッグ＆ドロップ',
        mission: '{{count}}人の友だちに同じ数ずつ分けよう'
    },
    howToPlay: {
        step1: {
            title: '友だちの数をかぞえよう',
            description: '友だちが何人いるか数えよう。'
        },
        step2: {
            title: 'くだものをドラッグ',
            description: 'くだものをかごに入れよう。'
        },
        step3: {
            title: '同じ数にそろえよう',
            description: '全部のかごを同じ数にすればクリア！'
        }
    }
} as const;

export default ja;
