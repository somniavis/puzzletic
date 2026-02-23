const en = {
    title: 'Hộp Trái Cây',
    subtitle: 'Đóng các bó bằng nhau!',
    description: 'Xếp các bó trái cây giống nhau vào từng hộp.',
    howToPlay: {
        step1: {
            title: 'Xem đơn hàng',
            description: 'Xem phiếu yêu cầu trước.'
        },
        step2: {
            title: 'Kéo các bó',
            description: 'Kéo các bó vào hộp.'
        },
        step3: {
            title: 'Khớp đồng đều',
            description: 'Làm cho tất cả hộp giống nhau.'
        }
    },
    formulaHint: 'Hãy lấp đầy tất cả hộp!',
    ui: {
        orderGroupsUnit: ' nhóm',
        orderEachUnit: ' mỗi nhóm',
        dragToBoxHint: 'Kéo trái cây vào các hộp!'
    },
    feedback: {
        fillAll: 'Hãy lấp đầy tất cả hộp trước.',
        retry: 'Hãy thử lại cùng đơn hàng này.'
    }
} as const;

export default en;
