const manifest = {
    title: '10フレームナンバー',
    subtitle: 'すばやく数えて、10で考えよう',
    description: 'ㅇㅇㅇ',
    powerups: {
        timeFreeze: 'ㅇㅇㅇ',
        extraLife: 'ㅇㅇㅇ',
        doubleScore: 'ㅇㅇㅇ'
    },
    ui: {
        placeholder: 'ㅇㅇㅇ',
        howManyHint: 'いくつ？'
    },
    howToPlay: {
        step1: { title: 'カードを見よう', description: '青か赤のドットを数えよう。' },
        step2: { title: '数字を選ぼう', description: '正しい答えをタップしよう。' },
        step3: { title: 'セットをクリア', description: '連続正解でパワーアップをゲット。' }
    }
} as const;

export default manifest;
