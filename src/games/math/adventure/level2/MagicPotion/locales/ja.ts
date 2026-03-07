const manifest = {
    title: 'Magic Potion',
    subtitle: 'まほうのざいりょうをまぜよう！',
    description: 'ㅇㅇㅇ',
    ui: {
        placeholder: 'ㅇㅇㅇ',
        makeLabel: 'MAKE',
        dragHint: 'Drag and drop 3 ingredients!',
        correct: 'CORRECT!',
        wrong: 'MISS!',
    },
    powerups: {
        timeFreeze: 'Time Freeze',
        extraLife: 'Extra Life',
        doubleScore: 'Double Score',
    },
    howToPlay: {
        step1: {
            title: '目標を確認',
            description: 'まず目標の数を見よう。',
        },
        step2: {
            title: '材料を3つ選ぶ',
            description: '数字・記号・数字を入れよう。',
        },
        step3: {
            title: '答えを完成',
            description: '目標と同じなら正解！',
        },
    },
} as const;

export default manifest;
