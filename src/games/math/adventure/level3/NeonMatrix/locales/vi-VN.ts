const manifest = {
    title: 'Neon Matrix',
    subtitle: 'Làm chủ bảng 8!',
    description: 'Trò chơi tốc độ để làm chủ quy luật chữ số tận cùng của bảng 8.',
    powerups: {
        timeFreeze: 'Đóng băng',
        extraLife: 'Thêm mạng',
        doubleScore: 'Gấp đôi'
    },
    ui: {
        tapHint: 'Chạm 8, 6, 4, 2 hoặc 0 để điền.',
        dragDropHint: 'Chạm 8, 6, 4, 2 hoặc 0 để điền.',
        patternHint: 'Hãy nhớ 8-6-4-2-0!',
        signTitle: 'Mã Bí Mật Bảng 8',
        signCode: '8-6-4-2-0',
        cellLabel: '8x{{index}}',
        cellAriaLabel: 'Ô ma trận {{index}}',
        modePattern: 'Làn Mẫu',
        modeVertical: 'Ghép Dọc'
    },
    howToPlay: {
        step1: {
            title: '8-6-4-2-0!',
            description: 'Hãy nhớ quy luật.'
        },
        step2: {
            title: 'Nhập chữ số',
            description: 'Chạm đúng số.'
        },
        step3: {
            title: 'Xong một set',
            description: 'Tăng combo!'
        }
    }
} as const;

export default manifest;
