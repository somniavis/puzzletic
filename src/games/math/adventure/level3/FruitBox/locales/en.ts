const en = {
    title: 'Fruit Box',
    subtitle: 'Pack equal bundles!',
    description: 'Pack the same fruit bundles into each box.',
    howToPlay: {
        step1: {
            title: 'Check Order',
            description: 'Look at the order card first.'
        },
        step2: {
            title: 'Drag Bundles',
            description: 'Drag fruit bundles into the boxes.'
        },
        step3: {
            title: 'Match Equally',
            description: 'Every box must have the same bundle setup.'
        }
    },
    formulaHint: 'Please fill all boxes!',
    feedback: {
        fillAll: 'Fill all boxes first.',
        retry: 'Try the same order again.'
    }
} as const;

export default en;
