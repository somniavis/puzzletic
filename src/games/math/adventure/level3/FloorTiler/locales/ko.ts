const ko = {
    title: '타일 깔기',
    subtitle: '완벽하게 타일을 채워봐!',
    description: '가로와 세로를 보고 넓이를 계산해 타일을 채워요.',
    ui: {
        targetLabel: '타일',
        progress: '{{filled}}/{{total}}',
        dragHint: '빈 칸에서 드래그해 같은 크기의 직사각형을 칠해요.',
        dragHintShort: '빈칸을 드래그해 타일 크기를 맞춰요.',
        boardComplete: '완성! 다음 방으로 이동 중...'
    },
    howToPlay: {
        step1: {
            title: '타일 확인',
            description: 'a × b 크기를 봐요.'
        },
        step2: {
            title: '드래그로 칠하기',
            description: '빈칸을 드래그해 맞춰요.'
        },
        step3: {
            title: '바닥 완성',
            description: '모든 칸을 채우면 클리어!'
        }
    }
} as const;

export default ko;
