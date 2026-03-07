const manifest = {
    title: '마법물약',
    subtitle: '마법 재료 섞기!',
    description: 'ㅇㅇㅇ',
    ui: {
        placeholder: 'ㅇㅇㅇ',
        makeLabel: '만들기',
        dragHint: 'Drag and drop 3 ingredients!',
        correct: '정답!',
        wrong: '오답!',
    },
    powerups: {
        timeFreeze: '시간 정지',
        extraLife: '추가 생명',
        doubleScore: '점수 2배',
    },
    howToPlay: {
        step1: {
            title: '목표 수 확인',
            description: '말풍선의 목표 숫자를 먼저 봐요.',
        },
        step2: {
            title: '재료 3개 선택',
            description: '숫자·기호·숫자를 솥에 넣어요.',
        },
        step3: {
            title: '정답 완성',
            description: '목표 수와 같으면 정답!',
        },
    },
} as const;

export default manifest;
