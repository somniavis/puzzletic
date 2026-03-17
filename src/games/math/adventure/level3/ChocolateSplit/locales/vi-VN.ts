const viVn = {
    title: 'Chocolate Split',
    subtitle: 'Tao cac nhom bang nhau',
    description: 'ㅇㅇㅇ',
    powerups: {
        timeFreeze: 'Freeze',
        extraLife: 'Life',
        doubleScore: 'Double'
    },
    ui: {
        divideBy: 'Chia thành',
        confirm: 'Kiểm tra',
        dragCutHint: 'Vẽ một đường rồi chạm Kiểm tra!',
        perGroupUnknown: 'Mỗi nhóm: ?',
        perGroupValue: 'Mỗi nhóm: {{value}}'
    },
    howToPlay: {
        step1: { title: 'Ve mot duong', description: 'Ve giua cac khoi' },
        step2: { title: 'Tao nhom bang nhau', description: 'Lam cho cac nhom bang nhau' },
        step3: { title: 'Cham Kiem tra', description: 'Cham khi thay dung' }
    }
} as const;

export default viVn;
