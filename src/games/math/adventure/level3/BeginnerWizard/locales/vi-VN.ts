export default {
    title: 'Pháp Sư Tập Sự',
    subtitle: 'Thành thạo bảng 0 và 1!',
    description: 'Chọn phép giữ/xoá để khớp mục tiêu.',
    ui: {
        targetLabel: 'Mục tiêu',
        protectHint: '🛡️ giữ nguyên',
        removeHint: '🕳️ xoá hết',
        tapSpellHint: 'Chạm vào phép!'
    },
    powerups: {
        timeFreeze: 'Đóng băng thời gian',
        extraLife: 'Thêm mạng',
        doubleScore: 'Nhân đôi điểm',
    },
    howToPlay: {
        step1: {
            title: 'Hai phép',
            description: 'Luyện cả hai phép.'
        },
        step2: {
            title: 'x1: Phép bảo vệ',
            description: 'Giữ nguyên đàn thú.'
        },
        step3: {
            title: 'x0: Phép xoá',
            description: 'Đưa đàn thú vào hố đen.'
        }
    }
} as const;
