const viVn = {
    title: 'Tiệm Donut',
    subtitle: 'Chia donut that deu nhau!',
    description: 'ㅇㅇㅇ',
    powerups: {
        timeFreeze: 'Freeze',
        extraLife: 'Life',
        doubleScore: 'Double'
    },
    ui: {
        mission: 'Hãy đóng gói donut theo từng nhóm {{count}} chiếc.',
        dragDropHint: 'Chạm để đặt hộp donut.'
    },
    howToPlay: {
        step1: { title: 'Đếm số donut', description: 'Đếm số donut trên kệ.' },
        step2: { title: 'Đặt hộp trước', description: 'Chạm ô chấm để đặt hộp.' },
        step3: { title: 'Đóng gói đều nhau', description: 'Lấp đầy mọi hộp với số lượng bằng nhau.' }
    }
} as const;

export default viVn;
