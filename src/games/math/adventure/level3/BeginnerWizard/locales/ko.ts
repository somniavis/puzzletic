export default {
    title: '초보마법사',
    subtitle: '0 또는 1 주문을 외워요!',
    description: '목표 숫자에 맞춰 보호/삭제 마법을 선택하세요.',
    ui: {
        targetLabel: '목표',
        protectHint: '🛡️ 모두 유지',
        removeHint: '🕳️ 모두 사라짐',
        tapSpellHint: '주문을 탭해!'
    },
    howToPlay: {
        step1: {
            title: '두 가지 스펠',
            description: '두 주문을 연습해보아요.'
        },
        step2: {
            title: 'x1: 보호마법',
            description: '동물들을 그대로 지켜요.'
        },
        step3: {
            title: 'x0: 삭제마법',
            description: '동물들을 블랙홀로 보내요.'
        }
    }
} as const;
