const manifest = {
    title: "Cắt Trái Cây",
    subtitle: "Cắt đúng đáp án!",
    description: "Tính số còn thiếu và cắt trái cây để hoàn thành.",
    howToPlay: {
        step1: {
            title: "Cắt mấy phần?",
            description: "Xác định số trước."
        },
        step2: {
            title: "Chọn dao",
            description: "Chọn con số khớp."
        },
        step3: {
            title: "Cắt trái cây",
            description: "Cắt để nộp đáp án."
        }
    },
    ui: {
        dragSliceHint: 'Kéo dao để cắt!'
    },
    powerups: {
        freeze: "Đóng băng thời gian",
        life: "Thêm mạng",
        double: "Điểm x2"
    }
};

export default manifest;
