const ko = {
    title: '네온 매트릭스',
    subtitle: '8단 마스터',
    description: '8단 끝자리 패턴을 익히는 스피드 퍼즐 게임입니다.',
    powerups: {
        timeFreeze: '시간정지',
        extraLife: '추가 생명',
        doubleScore: '점수 2배'
    },
    ui: {
        tapHint: '빈칸에 맞는 8·6·4·2·0을 눌러요.',
        dragDropHint: '빈칸에 맞는 8·6·4·2·0을 눌러요.',
        patternHint: '8-6-4-2-0을 기억해!',
        signTitle: '8단 시크릿 코드',
        signCode: '8-6-4-2-0',
        cellLabel: '8x{{index}}',
        cellAriaLabel: '매트릭스 칸 {{index}}',
        modePattern: '패턴 레인',
        modeVertical: '상하 매칭'
    },
    howToPlay: {
        step1: {
            title: '8-6-4-2-0!',
            description: '패턴을 기억해요.'
        },
        step2: {
            title: '숫자 입력',
            description: '맞는 숫자를 탭해요.'
        },
        step3: {
            title: '세트 클리어',
            description: '콤보 업!'
        }
    }
} as const;

export default ko;
