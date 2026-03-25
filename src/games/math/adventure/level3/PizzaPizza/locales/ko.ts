const ko = {
    title: '피자피자',
    subtitle: '각각 몇 조각일까?',
    description: 'ㅇㅇㅇ',
    powerups: {
        timeFreeze: '시간 정지',
        extraLife: '추가 생명',
        doubleScore: '점수 2배'
    },
    ui: {
        boardAriaLabel: '피자피자 보드',
        bubbleText: '{{sliceCount}}조각을 {{friendCount}}명이 나눠 먹자!',
        answerChoicesAriaLabel: '정답 보기',
        choiceLabel: '각각'
    },
    pizzaTypes: {
        pepperoni: '페퍼로니',
        cheese: '치즈',
        veggie: '야채'
    },
    howToPlay: {
        step1: { title: '피자를 살펴봐요', description: '어떻게 나뉘는지 생각해요' },
        step2: { title: '숫자를 골라요', description: '각각 몇 조각인지' },
        step3: { title: '나눔을 확인해요', description: '같으면 성공' }
    }
} as const;

export default ko;
