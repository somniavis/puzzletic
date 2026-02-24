const ko = {
    title: '세포복제',
    subtitle: '2단 · 4단 마스터',
    description: '2단과 4단을 연습하는 게임입니다.',
    powerups: {
        timeFreeze: '시간정지',
        extraLife: '추가 생명',
        doubleScore: '점수 2배'
    },
    ui: {
        dragDropHint: '세포에 드래그&드롭'
    },
    howToPlay: {
        step1: {
            title: '세포 수 확인',
            description: '가운데 세포를 세어요.'
        },
        step2: {
            title: '목표 확인',
            description: '색상과 숫자를 봐요.'
        },
        step3: {
            title: '드래그 복제',
            description: '시약을 놓고 정답을 맞혀요.'
        }
    }
} as const;

export default ko;
