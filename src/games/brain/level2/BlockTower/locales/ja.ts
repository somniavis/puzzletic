const ja = {
    title: 'ブロックタワー',
    subtitle: 'かしこく積んで、バランスキープ！',
    description: '同じブロックの束をグリッドに落として、安定したタワーを作ろう。',
    howToPlay: {
        step1: {
            title: 'タップで落とす',
            description: 'タップしてブロックを落とします。'
        },
        step2: {
            title: 'バランスを保つ',
            description: 'タワーのバランスを保ちます。'
        },
        step3: {
            title: 'もっと高く積もう',
            description: '一番上まで積めばクリア！'
        }
    },
    ui: {
        target: '目標',
        bundles: '束',
        bundleCard: '現在の氷の束',
        balanceStatus: 'バランス',
        nextBlock: '次のブロック',
        good: 'グッド',
        normal: 'ノーマル',
        risk: '危険',
        clickDropHint: 'タップで落とすよ！',
        dropHint: 'グリッド上で移動してタップで落とす',
        defaultGuide: '倒れないように積んでミッションをクリア！'
    },
    feedback: {
        success: 'ナイススタック！次のミッションへ！',
        collapse: '倒れてしまった！同じミッションに再挑戦。'
    }
} as const;

export default ja;
