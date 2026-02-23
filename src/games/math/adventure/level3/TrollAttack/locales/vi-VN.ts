const en = {
    title: 'Troll Tấn Công',
    subtitle: 'Bảo vệ lâu đài!',
    description: 'Chặn troll bằng viên đạn đại bác đúng.',
    howToPlay: {
        step1: {
            title: 'Troll đang tới',
            description: 'Xem phép tính.'
        },
        step2: {
            title: 'Nạp đạn',
            description: 'Chọn viên đạn số đúng.'
        },
        step3: {
            title: 'Bắn!',
            description: 'Kéo vào đại bác và khai hỏa.'
        }
    },
    ui: {
        dragHint: 'Kéo bom vào đại bác!',
        dragOverlayHint: 'Kéo bom vào đại bác!',
        dropHint: 'Thả ở đây để bắn!',
        underHit: 'Quá yếu! Troll đang lao tới.',
        overHit: 'Quá mạnh! Troll đã chặn được.',
        correctHit: 'Trúng đích! Đánh bại troll.',
        castleHit: 'Một troll đã tới lâu đài! Bạn mất 1 mạng.'
    }
} as const;

export default en;
