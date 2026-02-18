const manifest = {
    title: "과일 자르기",
    subtitle: "정답을 싹둑!",
    description: "물음표에 들어갈 숫자는? 정답 과일을 싹둑 잘라주세요!",
    howToPlay: {
        step1: { title: '몇 개로 자를까?', description: '식을 보고 개수를 정해요' },
        step2: { title: '칼 선택', description: '정답 숫자 칼 고르기' },
        step3: { title: '과일 자르기', description: '과일을 잘라 제출' }
    },
    ui: {
        dragSliceHint: '칼을 옮겨 과일을 잘라요!'
    },
    powerups: {
        freeze: "시간 멈춤",
        life: "생명 추가",
        double: "점수 2배"
    }
};

export default manifest;
