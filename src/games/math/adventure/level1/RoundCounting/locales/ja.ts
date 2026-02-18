export default {
    title: 'くるくるさがし',
    subtitle: 'うごくターゲット！',
    description: '絵がシャッフルするよ！　もくひょうの絵をはやく見つけてね。',
    howToPlay: {
        step1: { title: 'いくつ見つける？', description: 'まず目標の数を見よう。' },
        step2: { title: 'すばやくタップ', description: '同じ絵をすばやくタップ。' },
        step3: { title: 'タップごとにシャッフル', description: 'シャッフル後も最後まで。' }
    },
    ui: {
        clinks: 'クリックしよう！',
        ready: '準備'
    },
    target: '{{count}}この {{emoji}} をさがせ',
    shuffleMessage: 'シャッフル！',
    powerups: {
        freeze: 'じかんストップ！',
        life: 'ライフかいふく！',
        double: 'スコア2ばい！'
    }
};
