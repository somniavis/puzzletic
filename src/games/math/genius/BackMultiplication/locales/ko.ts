export default {
    lv1: {
        title: 'Back 곱셈 1',
        subtitle: '1-digit x 1-digit',
    },
    lv2: {
        title: 'Back 곱셈 2',
        subtitle: '2-digit x 1-digit',
    },
    lv3: {
        title: 'Back 곱셈 3',
        subtitle: '3-digit x 1-digit',
    },
    lv4: {
        title: 'Back 곱셈 4',
        subtitle: '2-digit x 2-digit',
        desc: '크로스 곱셈법으로 풀어보세요.'
    },
    description: '뒤에서부터 계산하는 부분 곱셈법!',
    howToPlay: {
        step1: { title: '일의 자리' },
        step2: { title: '십의 자리' },
        step3: { title: '합계' }, // Lv1 Total
        step3_hundreds: { title: '백의 자리' }, // Lv2 Step 3
        step4: { title: '합계' }, // Lv2 Total
        // Lv3
        step3_cross1: { title: '크로스 곱셈 1' },
        step4_cross2: { title: '크로스 곱셈 2' },
        step5: { title: '합계' }
    },
    hint: {
        step1: '일의 자리 곱셈 먼저!',
        step2: '십의 자리 곱셈! (대각선)',
        step3: '세로로 더해서 정답 완성!',
        step3_hundreds: '백의 자리 곱셈!',
        step4: '모든 결과를 더해요!',
        // Lv3 Hints
        step1_lv3: '일의 자리끼리 곱해요!',
        step2_lv3: '십의 자리끼리 곱해요!',
        step3_cross1: '위 십의 자리 x 아래 일의 자리 (↘)',
        step4_cross2: '위 일의 자리 x 아래 십의 자리 (↙)',
        step5: '모든 부분 곱을 더해 완성해요!'
    }
};
