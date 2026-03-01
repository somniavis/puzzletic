const vi = {
    title: 'To Ong Luc Giac',
    subtitle: 'lam chu bang nhan 6!',
    description: 'Lap day to ong va lam chu bang nhan 6.',
    question: 'Tổng cộng có bao nhiêu cạnh?',
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
        tapEverySpotFirst: 'Chạm đúng số lượng ô lục giác.'
    },
    howToPlay: {
        step1: { title: 'Xem bai toan', description: 'Nhin ⬢ 6×n.' },
        step2: { title: 'Lap day to ong', description: 'Cham hinh luc giac n lan.' },
        step3: { title: 'Chon dap an', description: 'Chon tong so canh.' }
    }
} as const;

export default vi;
