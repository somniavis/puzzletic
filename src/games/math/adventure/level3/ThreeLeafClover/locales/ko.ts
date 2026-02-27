const ko = {
    title: '세잎 클로버',
    subtitle: '3단 마스터',
    description: '클로버를 피우며 3단을 익혀요!',
    question: '세잎클로버의 잎이 모두 몇개?',
    powerups: {
        timeFreeze: '시간 정지',
        extraLife: '생명 추가',
        doubleScore: '점수 2배'
    },
    a11y: {
        ladybug1: '무당벌레 1',
        ladybug2: '무당벌레 2',
        beetle: '풍뎅이',
        cloverDot: '클로버 자리 {{index}}'
    },
    ui: {
        tapEverySpotFirst: 'tap every spot first.'
    },
    howToPlay: {
        step1: { title: '문제 확인', description: '☘️ 3×n을 봐요.' },
        step2: { title: '클로버 피우기', description: '점을 모두 눌러요.' },
        step3: { title: '정답 고르기', description: '맞는 숫자를 선택해요.' }
    }
} as const;

export default ko;
