const ko = {
    title: '코인 캐셔',
    subtitle: '5단 · 10단 마스터',
    description: '칩 묶음을 골라 목표 수를 맞추세요.',
    ui: {
        customerRequest: '총 {{target}}코인 주세요!',
        coinLabel: '코인',
        bundleAria: '{{size}}코인 묶음',
        bundle5: '5개 묶음',
        bundle10: '10개 묶음',
        chooseCount: '묶음 개수 선택',
        dropZone: '칩 박스'
    },
    howToPlay: {
        step1: {
            title: '손님 등장',
            description: '요청 코인 수를 봐요.'
        },
        step2: {
            title: '코인 종류 확인',
            description: '5인지 10인지 봐요.'
        },
        step3: {
            title: '개수 선택',
            description: '정답 개수를 눌러요.'
        }
    }
} as const;

export default ko;
