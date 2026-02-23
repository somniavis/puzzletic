const en = {
    title: 'Tháp Khối',
    subtitle: 'Xếp khéo, giữ vững!',
    description: 'Thả các khối bằng nhau lên lưới để xây tháp ổn định.',
    howToPlay: {
        step1: {
            title: 'Chạm để thả',
            description: 'Chạm để thả khối.'
        },
        step2: {
            title: 'Giữ cân bằng',
            description: 'Giữ tháp cân bằng.'
        },
        step3: {
            title: 'Xây cao hơn',
            description: 'Đạt đỉnh để qua màn.'
        }
    },
    ui: {
        target: 'Mục tiêu',
        bundles: 'Khối',
        bundleCard: 'Khối hiện tại',
        balanceStatus: 'Cân bằng',
        nextBlock: 'Khối tiếp theo',
        good: 'Tốt',
        normal: 'Bình thường',
        risk: 'Nguy hiểm',
        clickDropHint: 'Chạm để thả!',
        dropHint: 'Di chuyển trên lưới và chạm để thả',
        defaultGuide: 'Xây chồng vững chắc để hoàn thành nhiệm vụ.'
    },
    feedback: {
        success: 'Xếp chuẩn! Nhiệm vụ tiếp theo!',
        collapse: 'Tháp bị đổ! Hãy thử lại nhiệm vụ này.'
    }
} as const;

export default en;
