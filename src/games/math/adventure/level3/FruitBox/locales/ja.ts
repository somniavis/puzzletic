const ja = {
    title: 'フルーツボックス',
    subtitle: '同じ束でパッキング！',
    description: 'すべての箱に同じフルーツの束を入れましょう。',
    howToPlay: {
        step1: {
            title: '注文を確認',
            description: '先に注文カードを見ます。'
        },
        step2: {
            title: '束をドラッグ',
            description: '束を箱へ移動します。'
        },
        step3: {
            title: '同じ形にそろえる',
            description: '箱の構成を同じにします。'
        }
    },
    formulaHint: 'すべての箱を埋めてください！',
    ui: {
        dragToBoxHint: 'フルーツを箱へドラッグ！'
    },
    feedback: {
        fillAll: 'まずすべての箱を埋めてください。',
        retry: '同じ注文をもう一度やってみましょう。'
    }
} as const;

export default ja;
