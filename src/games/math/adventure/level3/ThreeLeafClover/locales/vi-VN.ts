const vi = {
    title: 'Co Ba La',
    subtitle: 'lam chu bang nhan 3!',
    description: 'Lam no co ba la va lam chu bang nhan 3.',
    question: 'Tong so la co ba la la bao nhieu?',
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
    },
    ui: {
        tapEverySpotFirst: 'tap every spot first.'
    },
    howToPlay: {
        step1: { title: 'Xem bai toan', description: 'Nhin ☘️ 3×n.' },
        step2: { title: 'Lam no co ba la', description: 'Cham tat ca cac cham.' },
        step3: { title: 'Chon dap an', description: 'Chon so dung.' }
    }
} as const;

export default vi;
