const manifest = {
    title: 'ロックオープン',
    subtitle: 'パスコードを見つけよう！',
    description: '2つの数字を選んで目標の数字を作ろう。',
    ui: {
        pickTwo: '数字を2つ選んでください',
    },
    powerups: {
        timeFreeze: '時間停止',
        extraLife: 'ライフ追加',
        doubleScore: 'スコア2倍',
    },
    howToPlay: {
        step1: {
            title: '+/- 目標を確認',
            description: '目標の数字を確認しよう！',
        },
        step2: {
            title: '数字を2つ選択',
            description: '2つのパスコード数字を見つけよう！',
        },
        step3: {
            title: '鍵を開けよう！',
            description: '鍵開け成功！',
        },
    },
} as const;

export default manifest;
