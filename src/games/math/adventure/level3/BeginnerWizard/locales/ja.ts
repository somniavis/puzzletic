export default {
    title: '見習い魔法使い',
    subtitle: '0か1の呪文を唱えよう！',
    description: '目標に合わせて保護/削除魔法を選ぼう。',
    ui: {
        targetLabel: '目標',
        protectHint: '🛡️ ぜんぶ残る',
        removeHint: '🕳️ ぜんぶ消える'
    },
    howToPlay: {
        step1: {
            title: '2つの呪文',
            description: '2つの呪文を練習しよう。'
        },
        step2: {
            title: 'x1: 保護の呪文',
            description: '動物たちをそのまま守るよ。'
        },
        step3: {
            title: 'x0: 削除の呪文',
            description: '動物たちをブラックホールへ送るよ。'
        }
    }
} as const;
