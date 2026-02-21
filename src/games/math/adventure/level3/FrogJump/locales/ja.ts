const ja = {
    title: 'カエルジャンプ',
    subtitle: 'ジャンプ、ジャンプ、ジャンプ！',
    description: '目盛りの正しい数を選んでカエルをジャンプさせよう。',
    howToPlay: {
        step1: {
            title: '問題を見る',
            description: 'カエルの上にあるかけ算を確認します。'
        },
        step2: {
            title: '目盛りを選ぶ',
            description: '縦の数直線から正しい数をタップします。'
        },
        step3: {
            title: 'ジャンプして判定',
            description: 'カエルが1段ずつ跳んで、到着後に正誤判定します。'
        }
    }
} as const;

export default ja;
