const ko = {
    title: '개구리 점프',
    subtitle: '점프,점프,점프!',
    description: '눈금의 정답 숫자를 골라 개구리를 점프시켜요.',
    howToPlay: {
        step1: {
            title: '문제 확인',
            description: '개구리 위 곱셈 문제를 보고 정답을 계산해요.'
        },
        step2: {
            title: '눈금 선택',
            description: '수직선의 숫자 버튼 중 정답 눈금을 탭해요.'
        },
        step3: {
            title: '점프로 도착',
            description: '개구리가 한 칸씩 점프해 도착하면 정답을 판정해요.'
        }
    }
} as const;

export default ko;
