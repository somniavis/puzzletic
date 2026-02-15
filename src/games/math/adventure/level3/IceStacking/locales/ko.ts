const ko = {
    title: '얼음쌓기',
    subtitle: '넘어지지 않게 잘 쌓아요!',
    description: '같은 얼음 묶음을 그리드에 떨어뜨려 안정적인 탑을 완성하세요.',
    howToPlay: {
        step1: {
            title: '미션 보기',
            description: '위 미션을 확인해요.'
        },
        step2: {
            title: '탭해서 드롭',
            description: '탭해서 얼음을 내려요.'
        },
        step3: {
            title: '중심 맞추기',
            description: '중심 위로 쌓으면 성공!'
        }
    },
    ui: {
        target: '목표',
        bundles: '묶음',
        bundleCard: '현재 얼음 묶음',
        dropHint: '그리드 위에서 이동 후 탭해서 떨어뜨리기',
        defaultGuide: '무너지지 않게 쌓으면 미션 성공!'
    },
    feedback: {
        success: '완벽해요! 다음 미션으로 이동합니다.',
        collapse: '무너졌어요! 같은 미션을 다시 도전하세요.'
    }
} as const;

export default ko;
