const manifest = {
    title: '자물쇠 열기',
    subtitle: '비밀번호를 찾아요!',
    description: '두 숫자를 선택해 목표 숫자를 만드세요.',
    ui: {
        pickTwo: '숫자 두 개를 선택하세요',
    },
    powerups: {
        timeFreeze: '시간 정지',
        extraLife: '추가 생명',
        doubleScore: '점수 2배',
    },
    howToPlay: {
        step1: {
            title: '+/- 목표 확인',
            description: '목표 숫자를 확인해요!',
        },
        step2: {
            title: '숫자 두 개 선택',
            description: '두 개의 비밀번호를 찾아요!',
        },
        step3: {
            title: '자물쇠 열기!',
            description: '자물쇠 열기 성공!',
        },
    },
} as const;

export default manifest;
