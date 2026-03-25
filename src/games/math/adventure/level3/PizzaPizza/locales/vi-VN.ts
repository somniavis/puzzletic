const vi = {
    title: 'Pizza Pizza',
    subtitle: 'Moi ban duoc may mieng?',
    description: 'ㅇㅇㅇ',
    powerups: {
        timeFreeze: 'Đóng băng thời gian',
        extraLife: 'Thêm mạng',
        doubleScore: 'Nhân đôi điểm'
    },
    ui: {
        boardAriaLabel: 'Bảng Pizza Pizza',
        bubbleText: `Hãy chia pizza {{pizzaType}} {{sliceCount}} miếng cho {{friendCount}} người bạn!`,
        answerChoicesAriaLabel: 'lua chon dap an',
        choiceLabel: 'Mỗi bạn'
    },
    pizzaTypes: {
        pepperoni: 'pepperoni',
        cheese: 'phô mai',
        veggie: 'rau củ'
    },
    howToPlay: {
        step1: { title: 'Nhìn chiếc pizza', description: 'Xem bánh chia thế nào' },
        step2: { title: 'Chọn một số', description: 'Mỗi bạn được mấy miếng' },
        step3: { title: 'Kiểm tra cách chia', description: 'Đều nhau là thắng' }
    }
} as const;

export default vi;
