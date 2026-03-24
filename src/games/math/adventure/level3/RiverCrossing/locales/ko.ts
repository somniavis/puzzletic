const ko = {
    title: '강건너기',
    subtitle: '정답 징검다리 찾기',
    description: '목표 수가 되는 나눗셈 징검다리만 골라 출발점에서 도착점까지 이동하세요.',
    powerups: {
        timeFreeze: '시간 정지',
        extraLife: '추가 생명',
        doubleScore: '점수 2배'
    },
    ui: {
        placeholderTitle: '맞는 식만 밟아 강을 건너요',
        placeholderBody: '목표 수가 되는 나눗셈 징검다리만 골라서 출발에서 도착까지 이동하세요.',
        targetLabel: '목표 수',
        startLabel: '출발',
        goalLabel: '도착',
        boardAriaLabel: '강건너기 보드',
        moveHint: '돌다리는 한번에 한칸씩!'
    },
    howToPlay: {
        step1: { title: '목표 수를 확인해요', description: '같은 값 찾기' },
        step2: { title: '한 칸씩 이동해요', description: '가까운 돌만' },
        step3: { title: '도착점까지 건너요', description: '틀리면 빠져요' }
    }
} as const;

export default ko;
