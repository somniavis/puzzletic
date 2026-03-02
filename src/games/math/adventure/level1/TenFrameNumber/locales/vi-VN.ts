const manifest = {
    title: 'Số trong khung 10',
    subtitle: 'Đếm nhanh, nghĩ theo chục',
    description: 'ㅇㅇㅇ',
    powerups: {
        timeFreeze: 'ㅇㅇㅇ',
        extraLife: 'ㅇㅇㅇ',
        doubleScore: 'ㅇㅇㅇ'
    },
    ui: {
        placeholder: 'ㅇㅇㅇ',
        howManyHint: 'bao nhiêu?'
    },
    howToPlay: {
        step1: { title: 'Xem các thẻ', description: 'Đếm chấm xanh hoặc đỏ.' },
        step2: { title: 'Chọn con số', description: 'Chạm vào đáp án đúng.' },
        step3: { title: 'Hoàn thành bộ', description: 'Tạo chuỗi đúng và nhận power-up.' }
    }
} as const;

export default manifest;
