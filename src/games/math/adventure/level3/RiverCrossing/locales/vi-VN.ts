const vi = {
    title: 'Qua Sông',
    subtitle: 'Tìm đá bước đúng',
    description: 'Chỉ chọn những hòn đá phép chia khớp với số mục tiêu và đi từ điểm bắt đầu đến đích.',
    powerups: {
        timeFreeze: 'Đóng băng thời gian',
        extraLife: 'Thêm mạng',
        doubleScore: 'Nhân đôi điểm'
    },
    ui: {
        placeholderTitle: 'Qua sông bằng biểu thức đúng',
        placeholderBody: 'Chỉ chọn những hòn đá phép chia khớp với số mục tiêu và đi từ điểm bắt đầu đến đích.',
        targetLabel: 'Mục tiêu',
        startLabel: 'Bắt đầu',
        goalLabel: 'Đích',
        boardAriaLabel: 'Bảng Qua Sông',
        moveHint: 'Mỗi lần chỉ một hòn đá!'
    },
    howToPlay: {
        step1: { title: 'Xem mục tiêu', description: 'Tìm cùng giá trị' },
        step2: { title: 'Đi từng bước', description: 'Chỉ đá gần' },
        step3: { title: 'Tới đích', description: 'Sai là rơi' }
    }
} as const;

export default vi;
