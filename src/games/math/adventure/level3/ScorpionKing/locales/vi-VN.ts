const vi = {
    title: 'Vua Bo Cap',
    subtitle: 'Can tan cong may lan?',
    description: 'ㅇㅇㅇ',
    powerups: {
        timeFreeze: 'Dong bang thoi gian',
        extraLife: 'Them mang',
        doubleScore: 'Nhan doi diem'
    },
    ui: {
        boardAriaLabel: 'Bang Scorpion King',
        hitsHint: 'Can tan cong may lan?'
    },
    howToPlay: {
        step1: { title: 'Xem HP va suc tan cong', description: 'Nghi ve so lan tan cong' },
        step2: { title: 'Chon so lan tan cong', description: 'Chon dap an dung' },
        step3: { title: 'Ha bo cap truoc', description: 'Thang truoc khi Jello het HP' }
    }
} as const;

export default vi;
