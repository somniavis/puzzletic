const ko = {
    title: '별자리 찾기',
    subtitle: '별을 밝혀요!',
    description: '1자리 × 1자리 곱셈을 풀고 별자리 세트를 완성해요.',
    howToPlay: {
        step1: {
            title: '문제 확인',
            description: '상단 곱셈 문제를 확인해요.'
        },
        step2: {
            title: '정답 별 터치',
            description: '정답 숫자가 있는 별을 눌러요.'
        },
        step3: {
            title: '세트 완성',
            description: '목표 별을 모두 밝힌 뒤 체크!'
        }
    },
    difficulty: {
        low: '하',
        mid: '중',
        high: '상',
        top: '최상'
    },
    sets: {
        northDipper: '북두칠성',
        january: '1월 · 염소자리',
        february: '2월 · 물병자리',
        march: '3월 · 물고기자리',
        april: '4월 · 양자리',
        may: '5월 · 황소자리',
        june: '6월 · 쌍둥이자리',
        july: '7월 · 게자리',
        august: '8월 · 사자자리',
        september: '9월 · 처녀자리',
        october: '10월 · 천칭자리',
        november: '11월 · 전갈자리',
        december: '12월 · 궁수자리'
    },
    ui: {
        setLabel: '세트 {{current}}/{{total}}',
        solveGuide: '정답 숫자 별을 찾아요.',
        solveGuideSub: '오답은 생명력 1 감소, 정답은 별 점등!',
        clearedTitle: '{{name}} 완성!',
        clearedSub: '체크를 눌러 다음 세트로 이동해요.'
    }
} as const;

export default ko;
