const ko = {
    title: '멍청이 트롤 어택',
    subtitle: '성을 지켜라!',
    description: '정답 대포알로 트롤을 막아보세요.',
    howToPlay: {
        step1: {
            title: '트롤이 온다',
            description: '머리 위 식을 봐.'
        },
        step2: {
            title: '폭탄을 장전해',
            description: '맞는 숫자 폭탄을 골라.'
        },
        step3: {
            title: '발사!',
            description: '대포로 끌어다 쏴!'
        }
    },
    ui: {
        dragHint: '폭탄을 대포에 드래그 하세요!',
        dropHint: '여기에 놓으면 발사!',
        underHit: '위력이 부족해요! 트롤이 돌진합니다.',
        overHit: '너무 강해요! 트롤이 방패로 막았습니다.',
        correctHit: '직격! 트롤을 물리쳤어요.',
        castleHit: '트롤이 성문에 닿았어요! 생명력이 줄었습니다.'
    }
} as const;

export default ko;
