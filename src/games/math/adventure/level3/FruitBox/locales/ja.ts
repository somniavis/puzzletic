const ja = {
    title: 'フルーツボックス',
    subtitle: '同じ束でパッキング！',
    description: 'すべての箱に同じフルーツの束を入れましょう。',
    howToPlay: {
        step1: {
            title: '注文を確認',
            description: 'まず注文カードを確認します。'
        },
        step2: {
            title: '束をドラッグ',
            description: 'フルーツの束を箱にドラッグします。'
        },
        step3: {
            title: '同じ形にそろえる',
            description: 'すべての箱の構成を同じにそろえます。'
        }
    },
    formulaHint: 'すべての箱を埋めてください！',
    feedback: {
        fillAll: 'まずすべての箱を埋めてください。',
        retry: '同じ注文をもう一度やってみましょう。'
    }
} as const;

export default ja;
