const manifest = {
    title: 'Thuốc Phép Thuật',
    'title-lv1': 'Thuốc Phép Thuật (Lv1)',
    'title-lv2': 'Thuốc Phép Thuật (Lv2)',
    subtitle: 'Trộn Nguyên Liệu Phép Thuật!',
    description: 'ㅇㅇㅇ',
    ui: {
        placeholder: 'ㅇㅇㅇ',
        makeLabel: 'MAKE',
        dragHint: 'Drag and drop 3 ingredients!',
        correct: 'CORRECT!',
        wrong: 'MISS!',
    },
    powerups: {
        timeFreeze: 'Time Freeze',
        extraLife: 'Extra Life',
        doubleScore: 'Double Score',
    },
    howToPlay: {
        step1: {
            title: 'Xem mục tiêu',
            description: 'Xem số mục tiêu trước.',
        },
        step2: {
            title: 'Chọn 3 nguyên liệu',
            description: 'Thả số, dấu, số vào vạc.',
        },
        step3: {
            title: 'Hoàn thành đáp án',
            description: 'Bằng số mục tiêu là đúng!',
        },
    },
} as const;

export default manifest;
