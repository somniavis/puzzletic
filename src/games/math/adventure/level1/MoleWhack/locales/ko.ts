const locale = {
    title: '생쥐 뿅망치',
    subtitle: '쥐를 잡아라!',
    description: 'ㅇㅇㅇ',
    powerups: {
        timeFreeze: '시간 정지',
        extraLife: '추가 생명',
        doubleScore: '점수 2배'
    },
    ui: {
        placeholder: 'ㅇㅇㅇ',
        restrictedSign: '생쥐 잡아라!',
        tapHint: '생쥐를 탭해요!'
    },
    howToPlay: {
        step1: { title: '생쥐가 나와요!', description: '수식을 보고 정답 생쥐를 찾아요.' },
        step2: { title: '맞는 생쥐 찾기', description: '정답 생쥐만 빠르게 탭해요.' },
        step3: { title: '뿅망치로 뿅!', description: '목표만큼 잡으면 다음 세트로!' }
    }
} as const;

export default locale;
