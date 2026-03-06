const locale = {
    title: '10 frame-add',
    subtitle: 'Tạo 10 và 20',
    description: 'Đổi chấm màu để tìm số còn thiếu.',
    question: 'Số nào điền vào ô trống?',
    powerups: {
        timeFreeze: 'Đóng băng thời gian',
        extraLife: 'Thêm mạng',
        doubleScore: 'Nhân đôi điểm'
    },
    ui: {
        tapRedHint: 'Hãy chạm vào các chấm đỏ!'
    },
    howToPlay: {
        step1: { title: 'Xem mục tiêu', description: 'Tìm số còn thiếu.' },
        step2: { title: 'Lật chấm', description: 'Đổi chấm đỏ thành xanh.' },
        step3: { title: 'Chọn đáp án', description: 'Chọn đúng con số.' }
    }
} as const;

export default locale;
