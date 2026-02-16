const ja = {
    title: 'おバカトロールアタック',
    subtitle: '城を守ろう！',
    description: '正しい砲弾でトロールを止めよう。',
    howToPlay: {
        step1: {
            title: 'トロールが来る',
            description: '頭の上の式を見よう。'
        },
        step2: {
            title: 'ボムを装填',
            description: '正しい数字のボムを選ぼう。'
        },
        step3: {
            title: '発射！',
            description: '大砲へドラッグして発射！'
        }
    },
    ui: {
        dragHint: '爆弾を大砲へドラッグしよう！',
        dropHint: 'ここに置くと発射！',
        underHit: '威力不足！トロールが突進します。',
        overHit: '強すぎる！トロールに防がれました。',
        correctHit: '命中！トロールを倒しました。',
        castleHit: 'トロールが城に到達！ライフが1減りました。'
    }
} as const;

export default ja;
