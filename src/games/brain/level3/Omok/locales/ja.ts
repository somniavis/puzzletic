const omokJa = {
    title: '五目並べ',
    subtitle: '5つ並べよう',
    description: 'AIと対戦して、先に5つの石を並べましょう！',
    howToPlay: {
        step1: {
            title: '石を置く',
            description: '交差点をタップして石を置こう。'
        },
        step2: {
            title: 'AIを止める',
            description: 'AIの5連を先に止めよう。'
        },
        step3: {
            title: '5つ完成',
            description: '先に5つ並べたら勝ち！'
        }
    },
    status: {
        playerTurn: 'あなたの番です',
        aiTurn: 'AIが考え中...',
        win: '勝利！',
        lose: '敗北...',
        draw: '引き分け！'
    },
    ui: {
        guideHint: 'AIより先に5つ並べよう！'
    }
};

export default omokJa;
