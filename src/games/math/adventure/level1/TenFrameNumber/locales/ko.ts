const manifest = {
    title: '10프레임-수',
    subtitle: '빠르게 세고, 10으로 생각해요',
    description: 'ㅇㅇㅇ',
    powerups: {
        timeFreeze: 'ㅇㅇㅇ',
        extraLife: 'ㅇㅇㅇ',
        doubleScore: 'ㅇㅇㅇ'
    },
    ui: {
        placeholder: 'ㅇㅇㅇ',
        howManyHint: '몇 개일까요?'
    },
    howToPlay: {
        step1: { title: '카드를 확인해요', description: '파란/빨간 점 개수를 세어요.' },
        step2: { title: '숫자를 골라요', description: '맞는 답을 눌러요.' },
        step3: { title: '세트를 클리어해요', description: '연속 정답으로 파워업을 얻어요.' }
    }
} as const;

export default manifest;
