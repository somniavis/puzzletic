const ja = {
    title: 'カエルジャンプ',
    subtitle: 'ジャンプ、ジャンプ、ジャンプ！',
    description: '目盛りの正しい数を選んでカエルをジャンプさせよう。',
    powerups: {
        timeFreeze: '時間停止',
        extraLife: 'ライフ追加',
        doubleScore: 'スコア2倍',
    },
    ui: {
        jumpHint: 'カエルは何回ジャンプする？'
    },
    howToPlay: {
        step1: {
            title: '目盛りをチェック！',
            description: 'ジャンプする距離を考えます。'
        },
        step2: {
            title: '数字ボタンをタップ',
            description: '答えを見つけて選びます。'
        },
        step3: {
            title: 'ジャンプで到着！',
            description: '正しい目盛りに着いたらクリア！'
        }
    }
} as const;

export default ja;
