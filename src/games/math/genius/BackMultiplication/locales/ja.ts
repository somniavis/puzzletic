export default {
    lv1: {
        title: '後ろから掛け算 1',
        subtitle: '1桁 × 1桁',
    },
    lv2: {
        title: '後ろから掛け算 2',
        subtitle: '2桁 × 1桁',
    },
    lv3: {
        title: '後ろから掛け算 3',
        subtitle: '3桁 × 1桁',
    },
    lv4: {
        title: '後ろから掛け算 4',
        subtitle: '2桁 × 2桁',
        desc: 'クロス掛け算で解いてみましょう。'
    },
    description: '後ろから順番に計算しよう！暗算の達人への近道！',
    howToPlay: {
        step1: { title: '一の位' },
        step2: { title: '十の位' },
        step3: { title: '合計' }, // Lv1 Total
        step3_hundreds: { title: '百の位' }, // Lv2 Step 3
        step4: { title: '合計' }, // Lv2 Total
        // Lv3
        step3_cross1: { title: 'クロス ①' },
        step4_cross2: { title: 'クロス ②' },
        step5: { title: '合計' },
        answer: { title: '答え' }
    },
    hint: {
        step1: '一の位同士を先に掛け算します。',
        step2: '十の位を掛け算します（斜め）。',
        step3: '縦に足して答えを完成させよう！',
        step3_hundreds: '百の位を掛け算します！',
        step4: 'すべての結果を足しましょう！',
        // Lv3 Hints
        step1_lv3: '一の位同士を掛け算します。',
        step2_lv3: '十の位同士を掛け算します。',
        step3_cross1: '上の十の位と下の一の位を掛けます (↘)',
        step4_cross2: '上の一の位と下の十の位を掛けます (↙)',
        step5: 'すべての部分積を足して完成です！',
        answer: '答えを入力してください。'
    }
};
