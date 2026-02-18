const ja = {
    title: 'アイススタッキング',
    subtitle: '倒れないように上手に積もう！',
    description: '同じ氷の束をグリッドに落として、安定したタワーを作ろう。',
    howToPlay: {
        step1: {
            title: 'ミッション確認',
            description: '上のミッションを見ます。'
        },
        step2: {
            title: 'タップで落とす',
            description: 'タップして落とします。'
        },
        step3: {
            title: '中心をキープ',
            description: '中心に積めばクリアです。'
        }
    },
    ui: {
        target: '目標',
        bundles: '束',
        bundleCard: '現在の氷の束',
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
