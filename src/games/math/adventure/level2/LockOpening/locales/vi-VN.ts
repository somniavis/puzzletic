const manifest = {
    title: 'Mở Khoá',
    subtitle: 'Tìm mã mở khoá!',
    description: 'Chọn hai số để tạo ra số mục tiêu.',
    ui: {
        pickTwo: 'Chọn hai số',
    },
    powerups: {
        timeFreeze: 'Đóng băng thời gian',
        extraLife: 'Thêm mạng',
        doubleScore: 'Nhân đôi điểm',
    },
    howToPlay: {
        step1: {
            title: 'Xem mục tiêu +/-',
            description: 'Xem số mục tiêu!',
        },
        step2: {
            title: 'Chọn hai số',
            description: 'Tìm hai số tạo thành mã mở khoá!',
        },
        step3: {
            title: 'Mở khoá!',
            description: 'Thành công! Ổ khoá đã mở!',
        },
    },
} as const;

export default manifest;
