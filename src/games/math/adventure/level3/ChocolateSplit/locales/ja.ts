const ja = {
    title: 'チョコわけ',
    subtitle: 'おなじ くみに わけよう',
    description: 'ㅇㅇㅇ',
    powerups: {
        timeFreeze: 'フリーズ',
        extraLife: 'ライフ',
        doubleScore: 'ダブル'
    },
    ui: {
        divideBy: 'わる',
        confirm: 'かくにん',
        dragCutHint: 'せんをひいて かくにんをタップ！',
        perGroupUnknown: '1くみ ?こ',
        perGroupValue: '1くみ {{value}}こ'
    },
    howToPlay: {
        step1: { title: 'せんをひこう', description: 'あいだに せんをひこう' },
        step2: { title: 'おなじ くみに わけよう', description: 'みんな おなじに わけよう' },
        step3: { title: 'かくにんをタップ', description: 'あってたら タップしよう' }
    }
} as const;

export default ja;
