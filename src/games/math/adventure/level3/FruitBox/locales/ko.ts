const ko = {
    title: '과일박스',
    subtitle: '같은 묶음으로 포장!',
    description: '각 상자에 같은 과일 묶음을 담아보세요.',
    howToPlay: {
        step1: {
            title: '주문 확인',
            description: '주문 카드를 먼저 봐요.'
        },
        step2: {
            title: '묶음 드래그',
            description: '묶음을 상자로 옮겨요.'
        },
        step3: {
            title: '동일하게 맞추기',
            description: '상자 구성을 모두 같게 맞춰요.'
        }
    },
    formulaHint: '상자를 모두 채워주세요!',
    ui: {
        orderGroupsUnit: '묶음',
        orderEachUnit: '개씩',
        dragToBoxHint: '과일을 상자로 드래그!'
    },
    feedback: {
        fillAll: '모든 상자를 먼저 채워주세요.',
        retry: '같은 주문을 다시 맞춰보세요.'
    }
} as const;

export default ko;
