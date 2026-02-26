const ko = {
    title: '10-프레임 팝',
    subtitle: '9단 마스터',
    description: '끝 버블을 터뜨리고 9단 식을 완성하세요.',
    howToPlay: {
        step1: { title: '끝 버블 터뜨리기', description: '각 행의 끝 버블만 터뜨리세요.' },
        step2: { title: '실수 피하기', description: '오답 버블은 생명력 1 감소.' },
        step3: { title: '정답 고르기', description: '올바른 결과를 선택하세요.' }
    },
    ui: {
        popHint: '마지막 버블들을 터뜨려!'
    }
} as const;

export default ko;
