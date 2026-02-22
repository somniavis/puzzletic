const manifest = {
    title: "명궁수",
    subtitle: "정답을 맞혀라!",
    description: "문제를 풀고 정답 과녁을 향해 활을 쏘세요.",
    howToPlay: {
        step1: { title: '목표 확인', description: '목표 기호를 봐요.' },
        step2: { title: '과녁 추적', description: '같은 기호를 찾아요.' },
        step3: { title: '발사', description: '링 명중: 10·8·6점 (×10).' }
    },
    powerups: {
        freeze: "시간 멈춤",
        life: "생명 추가",
        double: "점수 2배"
    },
    ui: {
        pullShootHint: "당기고, 쏘세요!",
        targetLabel: "목표"
    }
};

export default manifest;
