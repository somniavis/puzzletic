export default {
    lv1: {
        title: 'Back Multiplication 1',
        subtitle: '1-digit x 1-digit',
    },
    lv2: {
        title: 'Back Multiplication 2',
        subtitle: '2-digit x 1-digit',
    },
    lv3: {
        title: 'Back Multiplication 3',
        subtitle: '3-digit x 1-digit',
    },
    lv4: {
        title: 'Back Multiplication 4',
        subtitle: '2-digit x 2-digit',
        desc: 'Solve using the cross-link method.'
    },
    description: 'Calculate from the back using partial products!',
    howToPlay: {
        step1: { title: 'Units' },
        step2: { title: 'Tens' },
        step3: { title: 'Total' },
        step3_hundreds: { title: 'Hundreds' },
        step4: { title: 'Total' },
        // Lv3
        step3_cross1: { title: 'Cross Step 1' },
        step4_cross2: { title: 'Cross Step 2' },
        step5: { title: 'Total' }
    },
    hint: {
        step1: 'Multiply units (1s) first.',
        step2: 'Multiply tens (10s) next.',
        step3: 'Add results together!',
        step3_hundreds: 'Multiply hundreds (100s) next.',
        step4: 'Add results together!',
        // Lv3 Hints
        step1_lv3: 'Multiply units x units first.',
        step2_lv3: 'Multiply tens x tens next.',
        step3_cross1: 'Top Tens x Bottom Units (↘)',
        step4_cross2: 'Top Units x Bottom Tens (↙)',
        step5: 'Sum all partial products!'
    }
};
