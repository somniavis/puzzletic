const ja = {
    title: 'コインキャッシャー',
    subtitle: '5の段・10の段をマスター！',
    description: 'チップ束の数を選んで目標数を作ろう。',
    powerups: {
        timeFreeze: 'じかんストップ',
        extraLife: 'ライフかいふく',
        doubleScore: 'スコア2ばい'
    },
    ui: {
        customerRequest: '合計{{target}}コインにしてください！',
        coinLabel: 'コイン',
        bundleAria: '{{size}}コインの束',
        bundle5: '5個セット',
        bundle10: '10個セット',
        chooseCount: 'セット数を選ぶ',
        dropZone: 'チップボックス'
    },
    howToPlay: {
        step1: {
            title: 'お客さん登場',
            description: '目標コイン数を見よう。'
        },
        step2: {
            title: 'コイン種類確認',
            description: '5か10かを見よう。'
        },
        step3: {
            title: '個数選択',
            description: '正しい個数をタップ。'
        }
    }
} as const;

export default ja;
