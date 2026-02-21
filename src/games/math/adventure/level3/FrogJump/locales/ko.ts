const ko = {
    title: '개구리 점프',
    subtitle: '점프,점프,점프!',
    description: '눈금의 정답 숫자를 골라 개구리를 점프시켜요.',
    howToPlay: {
        step1: {
            title: '눈금 확인!',
            description: '점프할 거리를 계산해요.'
        },
        step2: {
            title: '숫자 버튼 탭',
            description: '답 찾아서 클릭해요.'
        },
        step3: {
            title: '점프로 도착해요',
            description: '정답 눈금에 도착하면 성공!'
        }
    }
} as const;

export default ko;
