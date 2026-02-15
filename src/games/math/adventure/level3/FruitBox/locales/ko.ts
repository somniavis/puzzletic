const ko = {
    title: '과일박스',
    subtitle: '같은 묶음으로 포장!',
    description: '각 상자에 같은 과일 묶음을 담아보세요.',
    howToPlay: {
        step1: {
            title: '주문 확인',
            description: '먼저 주문 카드를 확인하세요.'
        },
        step2: {
            title: '묶음 드래그',
            description: '과일 묶음을 상자로 드래그하세요.'
        },
        step3: {
            title: '동일하게 맞추기',
            description: '모든 상자의 묶음 구성이 같아야 합니다.'
        }
    },
    formulaHint: '상자를 모두 채워주세요!',
    feedback: {
        fillAll: '모든 상자를 먼저 채워주세요.',
        retry: '같은 주문을 다시 맞춰보세요.'
    }
} as const;

export default ko;
