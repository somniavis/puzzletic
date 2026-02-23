const en = {
    title: 'Tìm Chòm Sao',
    subtitle: 'Thắp sáng các vì sao!',
    description: 'Giải phép nhân 1 chữ số và hoàn thành từng bộ chòm sao.',
    howToPlay: {
        step1: {
            title: 'Xem phép tính',
            description: 'Giải phép tính.'
        },
        step2: {
            title: 'Thắp sao',
            description: 'Chạm vào ngôi sao đúng.'
        },
        step3: {
            title: 'Hoàn thành bộ',
            description: 'Thắp sáng toàn bộ rồi kiểm tra.'
        }
    },
    difficulty: {
        low: 'Dễ',
        mid: 'Vừa',
        high: 'Khó',
        top: 'Rất khó'
    },
    sets: {
        northDipper: 'Bắc Đẩu',
        january: 'Tháng 1 · Ma Kết',
        february: 'Tháng 2 · Bảo Bình',
        march: 'Tháng 3 · Song Ngư',
        april: 'Tháng 4 · Bạch Dương',
        may: 'Tháng 5 · Kim Ngưu',
        june: 'Tháng 6 · Song Tử',
        july: 'Tháng 7 · Cự Giải',
        august: 'Tháng 8 · Sư Tử',
        september: 'Tháng 9 · Xử Nữ',
        october: 'Tháng 10 · Thiên Bình',
        november: 'Tháng 11 · Bọ Cạp',
        december: 'Tháng 12 · Nhân Mã'
    },
    ui: {
        setLabel: 'Bộ {{current}}/{{total}}',
        clickCorrectStarHint: 'Chạm vào ngôi sao đúng!',
        solveGuide: 'Tìm đáp án ngôi sao đúng.',
        solveGuideSub: 'Chạm sai mất 1 mạng. Chạm đúng sẽ thắp sáng sao.',
        clearedTitle: 'Hoàn thành {{name}}!',
        clearedSub: 'Nhấn kiểm tra để sang bộ tiếp theo.'
    }
} as const;

export default en;
