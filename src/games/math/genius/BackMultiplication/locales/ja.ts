export default {
    lv1: {
        title: 'Back 掛け算 1',
        subtitle: '2桁 x 1桁',
    },
    lv2: {
        title: 'Back 掛け算 2',
        subtitle: '3桁 x 1桁',
    },
    lv3: {
        title: 'Back 掛け算 3',
        subtitle: '2桁 x 2桁',
        desc: 'クロス掛け算で解いてみましょう。'
    },
    description: '後ろから計算する部分積法！',
    howToPlay: {
        step1: { title: '一の位' },
        step2: { title: '十の位' },
        step3: { title: '合計' },
        step3_hundreds: { title: '百の位' },
        step4: { title: '合計' },
        // Lv3
        step3_cross1: { title: 'クロス掛け算 1' },
        step4_cross2: { title: 'クロス掛け算 2' },
        step5: { title: '合計' }
    },
    hint: {
        step1: '一の位を掛け算',
        step2: '十の位を掛け算 (斜め方向)',
        step3: '縦に足して答え完成！',
        step3_hundreds: '百の位を掛け算！',
        step4: 'すべての結果を足します！',
        // Lv3 Hints
        step1_lv3: '一の位同士を掛け算！',
        step2_lv3: '十の位同士を掛け算！',
        step3_cross1: '上の十の位 x 下の一の位 (↘)',
        step4_cross2: '上の一の位 x 下の十の位 (↙)',
        step5: 'すべての部分積を足して完成！'
    }
};
