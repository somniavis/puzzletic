export default {
    title: '見習い魔法使い',
    subtitle: '0の段・1の段をマスター！',
    description: '目標に合わせて保護/削除魔法を選ぼう。',
    ui: {
        targetLabel: '目標',
        protectHint: '🛡️ ぜんぶ残る',
        removeHint: '🕳️ ぜんぶ消える',
        tapSpellHint: '呪文をタップ！'
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
