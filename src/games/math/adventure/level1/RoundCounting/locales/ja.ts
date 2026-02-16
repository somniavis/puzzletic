export default {
    title: 'くるくるさがし',
    subtitle: 'うごくターゲット！',
    description: '絵がシャッフルするよ！　もくひょうの絵をはやく見つけてね。',
    howToPlay: {
        step1: { title: 'いくつ見つける？', description: 'まず目標の数を見よう' },
        step2: { title: 'すばやく見つける', description: '同じ絵をすぐタップ' },
        step3: { title: '全部見つける', description: 'シャッフル後も最後まで' }
    },
    target: '{{count}}この {{emoji}} をさがせ',
    shuffleMessage: 'シャッフル！',
    powerups: {
        freeze: 'じかんストップ！',
        life: 'ライフかいふく！',
        double: 'スコア2ばい！'
    }
};
