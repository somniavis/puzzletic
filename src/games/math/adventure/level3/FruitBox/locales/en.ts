const en = {
    title: 'Fruit Box',
    subtitle: 'Pack equal bundles!',
    description: 'Pack the same fruit bundles into each box.',
    howToPlay: {
        step1: {
            title: 'Check Order',
            description: 'Check the order card first.'
        },
        step2: {
            title: 'Drag Bundles',
            description: 'Drag bundles into boxes.'
        },
        step3: {
            title: 'Match Equally',
            description: 'Make all box setups the same.'
        }
    },
    formulaHint: 'Please fill all boxes!',
    ui: {
        orderGroupsUnit: ' groups',
        orderEachUnit: ' each',
        dragToBoxHint: 'Drag fruits to the boxes!'
    },
    feedback: {
        fillAll: 'Fill all boxes first.',
        retry: 'Try the same order again.'
    }
} as const;

export default en;
