const ko = {
    title: '블록 탑 쌓기',
    subtitle: '똑똑하게 쌓고, 균형을 지켜요!',
    description: '같은 블록 묶음을 그리드에 떨어뜨려 안정적인 탑을 완성하세요.',
    howToPlay: {
        step1: {
            title: '탭해서 떨어뜨리기',
            description: '탭해서 블록을 떨어뜨려요.'
        },
        step2: {
            title: '균형 유지하기',
            description: '탑의 균형을 유지해요.'
        },
        step3: {
            title: '더 높이 쌓기',
            description: '맨 위까지 쌓으면 클리어!'
        }
    },
    ui: {
        target: '목표',
        bundles: '묶음',
        bundleCard: '현재 얼음 묶음',
        balanceStatus: '밸런스 상태',
        nextBlock: '다음 블록',
        good: '좋음',
        normal: '보통',
        risk: '위기',
        clickDropHint: '클릭하면 떨어져요!',
        dropHint: '그리드 위에서 이동 후 탭해서 떨어뜨리기',
        defaultGuide: '무너지지 않게 쌓으면 미션 성공!'
    },
    feedback: {
        success: '완벽해요! 다음 미션으로 이동합니다.',
        collapse: '무너졌어요! 같은 미션을 다시 도전하세요.'
    }
} as const;

export default ko;
