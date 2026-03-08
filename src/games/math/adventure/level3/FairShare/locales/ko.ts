const ko = {
    title: '똑같이 나눠 줄게',
    subtitle: '같은 수로 나눠요!',
    description: '2단과 4단을 연습하는 게임입니다.',
    powerups: {
        timeFreeze: '시간정지',
        extraLife: '추가 생명',
        doubleScore: '점수 2배'
    },
    ui: {
        dragDropHint: '바구니에 드래그앤드롭 해요!',
        mission: '{{count}}명의 친구에게 똑같이 나눠주세요'
    },
    howToPlay: {
        step1: {
            title: '친구 수를 확인해요',
            description: '친구가 몇 명인지 세어요.'
        },
        step2: {
            title: '과일을 나눠 담아요',
            description: '과일을 드래그해 바구니에 넣어요.'
        },
        step3: {
            title: '모두 똑같이 맞춰요',
            description: '모든 바구니 수를 같게 맞추면 성공!'
        }
    }
} as const;

export default ko;
