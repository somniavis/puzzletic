const ko = {
    title: '도넛가게',
    subtitle: '도넛을 똑같이 포장해요!',
    description: 'ㅇㅇㅇ',
    powerups: {
        timeFreeze: '시간 정지',
        extraLife: '추가 생명',
        doubleScore: '점수 2배'
    },
    ui: {
        mission: '도넛을 {{count}}개씩 포장해주세요.',
        dragDropHint: '탭하여 도넛박스 배치'
    },
    howToPlay: {
        step1: { title: '도넛 수 확인', description: '선반의 도넛을 세어봐요.' },
        step2: { title: '상자 먼저 배치', description: '점선 칸을 탭해 상자를 놓아요.' },
        step3: { title: '같은 개수로 포장', description: '모든 상자를 같은 수로 채워요.' }
    }
} as const;

export default ko;
