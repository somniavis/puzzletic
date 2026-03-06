const locale = {
    title: '10 프레임-덧셈',
    subtitle: '10과 20 만들기',
    description: '점을 바꿔 빈칸 수를 찾아요.',
    question: '빈칸에는 어떤 수가 들어갈까?',
    powerups: {
        timeFreeze: '시간 정지',
        extraLife: '추가 생명',
        doubleScore: '점수 2배'
    },
    ui: {
        tapRedHint: '빨간점을 탭해요!'
    },
    howToPlay: {
        step1: { title: '목표 확인', description: '빈칸 수를 찾아요.' },
        step2: { title: '점 뒤집기', description: '빨간 점을 파랑으로.' },
        step3: { title: '정답 선택', description: '맞는 수를 골라요.' }
    }
} as const;

export default locale;
