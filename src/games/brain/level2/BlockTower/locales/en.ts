const en = {
    title: 'Block Tower',
    subtitle: 'Stack smart, stay steady!',
    description: 'Drop equal blocks onto the grid and build a stable tower.',
    howToPlay: {
        step1: {
            title: 'Tap to Drop',
            description: 'Tap to drop the block.'
        },
        step2: {
            title: 'Keep Balance',
            description: 'Keep the tower balanced.'
        },
        step3: {
            title: 'Build Higher',
            description: 'Reach the top to clear.'
        }
    },
    ui: {
        target: 'Target',
        bundles: 'Bundles',
        bundleCard: 'Current Ice Bundle',
        balanceStatus: 'Balance',
        nextBlock: 'Next Block',
        good: 'Good',
        normal: 'Normal',
        risk: 'Risk',
        clickDropHint: 'Tap to drop!',
        dropHint: 'Move on the grid and tap to drop',
        defaultGuide: 'Build a stable stack to clear the mission.'
    },
    feedback: {
        success: 'Perfect stack! Next mission!',
        collapse: 'The stack collapsed! Try the same mission again.'
    }
} as const;

export default en;
