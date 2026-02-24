const manifest = {
    title: 'Nhân Bản Tế Bào',
    subtitle: 'Làm chủ bảng 2 và 4!',
    description: 'Trò chơi nhân để luyện bảng cửu chương 2 và 4.',
    powerups: {
        timeFreeze: 'Đóng băng',
        extraLife: 'Thêm mạng',
        doubleScore: 'Gấp đôi'
    },
    ui: {
        dragDropHint: 'Kéo & thả vào tế bào'
    },
    howToPlay: {
        step1: {
            title: 'Đếm tế bào',
            description: 'Đếm tế bào ở giữa.'
        },
        step2: {
            title: 'Xem mục tiêu',
            description: 'Xem màu và con số.'
        },
        step3: {
            title: 'Kéo để nhân bản',
            description: 'Thả thuốc thử và chọn đúng.'
        }
    }
} as const;

export default manifest;
