import base from './base';

const ja = {
    ...base,
    title: 'フライトカレンダー',
    subtitle: '7の段マスター',
    question: 'あと何日で出発ですか？',
    howToPlay: {
        ...base.howToPlay,
        step2: { title: 'カレンダーを埋める', description: '日曜をタップすると1週埋まるよ。' },
        step3: { title: '答えを選ぶ', description: '出発まであと何日？' }
    },
    ui: {
        tapEverySpotFirst: '正しい回数だけ日曜日をタップしよう。'
    },
    weekdays: {
        mon: '月',
        tue: '火',
        wed: '水',
        thu: '木',
        fri: '金',
        sat: '土',
        sun: '日'
    },
    powerups: {
        timeFreeze: '時間停止',
        extraLife: 'ライフ追加',
        doubleScore: 'スコア2倍'
    },
    a11y: {
        ladybug1: 'てんとう虫1',
        ladybug2: 'てんとう虫2',
        beetle: 'かぶと虫',
        cloverDot: 'クローバーの位置 {{index}}'
    }
} as const;

export default ja;
