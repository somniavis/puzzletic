const ko = {
    title: 'Sign Shifter',
    subtitle: '나누기를 곱하기로 바꿔봐!',
    description: '얼음 기호를 깨고 빈칸에 들어갈 숫자를 골라요.',
    question: '{ ? }에 맞는 숫자는?',
    powerups: {
        timeFreeze: '시간 정지',
        extraLife: '생명 추가',
        doubleScore: '점수 2배'
    },
    howToPlay: {
        step1: { title: '문제 보기', description: '표시된 식을 확인해요.' },
        step2: { title: '얼음 깨기', description: '두 얼음 기호를 눌러 보기를 열어요.' },
        step3: { title: '정답 고르기', description: '아래에서 답 하나를 골라요.' }
    }
} as const;

export default ko;
