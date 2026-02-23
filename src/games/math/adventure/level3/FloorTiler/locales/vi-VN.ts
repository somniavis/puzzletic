const en = {
    title: 'Lát Sàn',
    subtitle: 'Lấp đầy ô gạch thật chuẩn!',
    description: 'Dùng chiều rộng và chiều cao để tính diện tích và lát sàn.',
    ui: {
        targetLabel: 'Gạch',
        progress: '{{filled}}/{{total}}',
        dragHint: 'Kéo trên ô trống để tô hình chữ nhật khớp mẫu.',
        dragHintShort: 'Kéo các ô trống để khớp viên gạch.',
        boardComplete: 'Tuyệt! Đang chuyển sang phòng tiếp theo...'
    },
    howToPlay: {
        step1: {
            title: 'Xem viên gạch',
            description: 'Xem kích thước a × b.'
        },
        step2: {
            title: 'Kéo để tô',
            description: 'Kéo các ô trống để khớp mẫu.'
        },
        step3: {
            title: 'Lấp đầy sàn',
            description: 'Lấp đầy tất cả ô để qua màn.'
        }
    }
} as const;

export default en;
