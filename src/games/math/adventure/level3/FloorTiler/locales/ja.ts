const ja = {
    title: 'フロアタイラー',
    subtitle: 'タイルを完璧に埋めよう！',
    description: 'よことたてを見て面積を計算し、タイルを埋めます。',
    ui: {
        targetLabel: 'タイル',
        progress: '{{filled}}/{{total}}',
        dragHint: '空いているマスをドラッグして同じ大きさの長方形を塗ろう。',
        dragHintShort: '空きマスをドラッグして形を合わせよう。',
        boardComplete: '完成！次の部屋へ移動中...'
    },
    howToPlay: {
        step1: {
            title: '問題を確認',
            description: 'よこ(a)とたて(b)を確認しよう。'
        },
        step2: {
            title: '面積を計算',
            description: 'a×bで必要なタイル数を求めよう。'
        },
        step3: {
            title: '部屋を完成',
            description: '答えを選んで床を完成させよう。'
        }
    }
} as const;

export default ja;
