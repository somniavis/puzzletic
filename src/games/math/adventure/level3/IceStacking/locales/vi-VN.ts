const en = {
    title: 'Xếp Băng',
    subtitle: 'Xếp cẩn thận, đừng đổ!',
    description: 'Thả các bó băng bằng nhau lên lưới để xây tháp vững chắc.',
    howToPlay: {
        step1: {
            title: 'Xem nhiệm vụ',
            description: 'Xem mục tiêu ở phía trên.'
        },
        step2: {
            title: 'Chạm để thả',
            description: 'Chạm để thả bó băng.'
        },
        step3: {
            title: 'Giữ thăng bằng',
            description: 'Xếp cân tâm để qua màn.'
        }
    },
    ui: {
        target: 'Mục tiêu',
        bundles: 'Các bó',
        bundleCard: 'Bó băng hiện tại',
        clickDropHint: 'Chạm để thả!',
        dropHint: 'Di chuyển trên lưới và chạm để thả',
        defaultGuide: 'Xây chồng vững chắc để hoàn thành nhiệm vụ.'
    },
    feedback: {
        success: 'Xếp chuẩn! Sang nhiệm vụ tiếp theo!',
        collapse: 'Chồng băng bị đổ! Hãy thử lại nhiệm vụ này.'
    }
} as const;

export default en;
