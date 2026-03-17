const ko = {
    title: '초콜릿 쪼개기',
    subtitle: '같은 묶음으로 나눠요',
    description: 'ㅇㅇㅇ',
    powerups: {
        timeFreeze: '시간 정지',
        extraLife: '추가 생명',
        doubleScore: '점수 2배'
    },
    ui: {
        divideBy: '나누기',
        confirm: '쪼개기',
        dragCutHint: '선을 긋고 쪼개기 클릭!',
        perGroupUnknown: '묶음당 ?개',
        perGroupValue: '묶음당 {{value}}개'
    },
    howToPlay: {
        step1: { title: '선을 그어요', description: '브릭 사이를 그어요' },
        step2: { title: '같은 묶음으로 나눠요', description: '같은 수로 나눠요' },
        step3: { title: '쪼개기를 눌러요', description: '맞으면 눌러요' }
    }
} as const;

export default ko;
