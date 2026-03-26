const ko = {
    title: '스콜피온 킹',
    subtitle: '몇 번 공격할까?',
    description: 'ㅇㅇㅇ',
    powerups: {
        timeFreeze: '시간 정지',
        extraLife: '추가 생명',
        doubleScore: '점수 2배'
    },
    ui: {
        boardAriaLabel: '스콜피온 킹 보드',
        hitsHint: '몇 번 공격할까?'
    },
    howToPlay: {
        step1: { title: '체력과 공격력을 봐요', description: '몇 번 공격할지 생각해요' },
        step2: { title: '공격 횟수를 골라요', description: '맞는 횟수 버튼을 선택해요' },
        step3: { title: '전갈을 먼저 쓰러뜨려요', description: '젤로 체력이 닳기 전에 이겨요' }
    }
} as const;

export default ko;
