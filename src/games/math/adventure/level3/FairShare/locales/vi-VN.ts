const manifest = {
    title: 'Chia Đều',
    subtitle: 'Chia cùng một số lượng!',
    description: 'Trò chơi nhân để luyện bảng cửu chương 2 và 4.',
    powerups: {
        timeFreeze: 'Đóng băng',
        extraLife: 'Thêm mạng',
        doubleScore: 'Gấp đôi'
    },
    ui: {
        dragDropHint: 'Kéo & thả vào tế bào',
        mission: 'Chia đều cho {{count}} người bạn.'
    },
    howToPlay: {
        step1: {
            title: 'Đếm số bạn',
            description: 'Đếm xem có bao nhiêu bạn.'
        },
        step2: {
            title: 'Kéo trái cây',
            description: 'Kéo trái cây vào giỏ.'
        },
        step3: {
            title: 'Chia cho bằng nhau',
            description: 'Làm các giỏ bằng nhau để thắng!'
        }
    }
} as const;

export default manifest;
