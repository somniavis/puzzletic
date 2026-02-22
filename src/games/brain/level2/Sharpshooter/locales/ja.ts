const manifest = {
    title: "名射手",
    subtitle: "正解の的を射抜こう！",
    description: "もんだいをといて、せいかいのマトをねらってね。",
    howToPlay: {
        step1: { title: '目標を見る', description: '目標シンボルを確認。' },
        step2: { title: '的を追う', description: '同じシンボルを探す。' },
        step3: { title: '発射', description: 'リング命中: 10/8/6 (×10)。' }
    },
    powerups: {
        freeze: "じかんストップ",
        life: "ライフかいふく",
        double: "スコア2ばい"
    },
    ui: {
        pullShootHint: "引いて、放とう！",
        targetLabel: "ターゲット"
    }
};

export default manifest;
