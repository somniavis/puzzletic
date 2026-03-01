import base from './base';

const vi = {
    ...base,
    title: 'Lich Bay',
    subtitle: 'Bac thay bang 7',
    question: 'Còn bao nhiêu ngày nữa thì khởi hành?',
    howToPlay: {
        ...base.howToPlay,
        step2: { title: 'Điền Lịch', description: 'Chạm Chủ nhật để điền 1 tuần.' },
        step3: { title: 'Chọn Đáp Án', description: 'Còn bao nhiêu ngày nữa?' }
    },
    ui: {
        tapEverySpotFirst: 'Chạm đúng số Chủ nhật cần thiết.'
    },
    weekdays: {
        mon: 'T2',
        tue: 'T3',
        wed: 'T4',
        thu: 'T5',
        fri: 'T6',
        sat: 'T7',
        sun: 'CN'
    },
    powerups: {
        timeFreeze: 'Dong Bang Thoi Gian',
        extraLife: 'Them Mang',
        doubleScore: 'Nhan Doi Diem'
    },
    a11y: {
        ladybug1: 'Bo rua 1',
        ladybug2: 'Bo rua 2',
        beetle: 'Bo hung',
        cloverDot: 'Vi tri co ba la {{index}}'
    }
} as const;

export default vi;
