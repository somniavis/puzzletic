export default {
    lv1: {
        title: '뒤에서 곱하기 1',
        subtitle: '한 자리 x 한 자리',
    },
    lv2: {
        title: '뒤에서 곱하기 2',
        subtitle: '두 자리 x 한 자리',
    },
    lv3: {
        title: '뒤에서 곱하기 3',
        subtitle: '세 자리 x 한 자리',
    },
    lv4: {
        title: '뒤에서 곱하기 4',
        subtitle: '두 자리 x 두 자리',
        desc: '크로스 곱셈법으로 풀어보세요.'
    },
    description: '뒤에서부터 차근차근 곱해요! 암산 천재가 되는 지름길!',
    howToPlay: {
        step1: { title: '일의 자리' },
        step2: { title: '십의 자리' },
        step3: { title: '합계' }, // Lv1 Total
        step3_hundreds: { title: '백의 자리' }, // Lv2 Step 3
        step4: { title: '합계' }, // Lv2 Total
        // Lv3
        step3_cross1: { title: '크로스 ①' },
        step4_cross2: { title: '크로스 ②' },
        step5: { title: '합계' }
    },
    hint: {
        step1: '일의 자리끼리 먼저 곱해요.',
        step2: '십의 자리를 곱해요. (대각선)',
        step3: '세로로 더해서 답을 구해요!',
        step3_hundreds: '백의 자리를 곱해요!',
        step4: '모든 결과를 더해요!',
        // Lv3 Hints
        step1_lv3: '일의 자리끼리 곱해요.',
        step2_lv3: '십의 자리끼리 곱해요.',
        step3_cross1: '위 십의 자리와 아래 일의 자리를 곱해요 (↘)',
        step4_cross2: '위 일의 자리와 아래 십의 자리를 곱해요 (↙)',
        step5: '모든 부분 곱을 더해서 완성해요!'
    }
};
