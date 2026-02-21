export default {
    title: '초보마법사',
    subtitle: '마법으로 동물 가족을 지켜요!',
    description: '목표 숫자에 맞춰 보호/삭제 마법을 선택하세요.',
    ui: {
        targetLabel: '목표'
    },
    howToPlay: {
        step1: {
            title: '목표 숫자 확인',
            description: '상단 목표 박스의 숫자를 확인하세요.'
        },
        step2: {
            title: '마법 선택',
            description: '보호(x1) 또는 삭제(x0) 마법을 고르세요.'
        },
        step3: {
            title: '동물 가족 이동',
            description: '선택한 마법에 따라 동물 가족이 이동해요.'
        }
    }
} as const;
