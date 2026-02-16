const ja = {
    title: '星座さがし',
    subtitle: '星を光らせよう！',
    description: '1けた×1けたのかけ算を解いて、星座セットを完成しよう。',
    howToPlay: {
        step1: {
            title: '問題を確認',
            description: '上のかけ算問題を見よう。'
        },
        step2: {
            title: '正解の星をタップ',
            description: '答えの数字がある星をタップ。'
        },
        step3: {
            title: 'セット完成',
            description: '目標の星を全部光らせたらチェック！'
        }
    },
    difficulty: {
        low: '低',
        mid: '中',
        high: '高',
        top: '最上'
    },
    sets: {
        northDipper: '北斗七星',
        january: '1月・やぎ座',
        february: '2月・みずがめ座',
        march: '3月・うお座',
        april: '4月・おひつじ座',
        may: '5月・おうし座',
        june: '6月・ふたご座',
        july: '7月・かに座',
        august: '8月・しし座',
        september: '9月・おとめ座',
        october: '10月・てんびん座',
        november: '11月・さそり座',
        december: '12月・いて座'
    },
    ui: {
        setLabel: 'セット {{current}}/{{total}}',
        solveGuide: '正解の数字の星を見つけよう。',
        solveGuideSub: 'ミスでライフ-1、正解で星が光る。',
        clearedTitle: '{{name}} クリア！',
        clearedSub: 'チェックで次のセットへ。'
    }
} as const;

export default ja;
