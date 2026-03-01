const ko = {
    title: '6각형 벌집',
    subtitle: '6단 마스터',
    description: '벌집을 채우며 6단을 익혀요!',
    question: '육각형 변은 모두 몇 개일까요?',
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
        tapEverySpotFirst: '정확한 개수의 육각형을 눌러요.'
    },
    howToPlay: {
        step1: { title: '문제 확인', description: '⬢ 6×n을 봐요.' },
        step2: { title: '벌집 채우기', description: '육각형을 n번 눌러요.' },
        step3: { title: '정답 고르기', description: '전체 변의 수를 선택해요.' }
    }
} as const;

export default ko;
