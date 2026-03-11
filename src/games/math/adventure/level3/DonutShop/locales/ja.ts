const ja = {
    title: 'ドーナツショップ',
    subtitle: 'ドーナツを同じ数ずつ包もう!',
    description: 'ㅇㅇㅇ',
    powerups: {
        timeFreeze: 'フリーズ',
        extraLife: 'ライフ',
        doubleScore: 'ダブル'
    },
    ui: {
        mission: 'ドーナツを{{count}}個ずつ包んでください。',
        dragDropHint: 'タップしてドーナツ箱を配置しよう。'
    },
    howToPlay: {
        step1: { title: 'ドーナツ数を確認', description: '棚のドーナツを数えよう。' },
        step2: { title: '先に箱を配置', description: '点線スロットをタップして箱を置こう。' },
        step3: { title: '同じ数で包装', description: 'すべての箱を同じ数で満たそう。' }
    }
} as const;

export default ja;
