const en = {
    title: 'Ice Stacking',
    subtitle: 'Stack carefully and don’t topple!',
    description: 'Drop equal ice bundles onto the grid and build a stable tower.',
    howToPlay: {
        step1: {
            title: 'Check Mission',
            description: 'Check the mission on top.'
        },
        step2: {
            title: 'Tap to Drop',
            description: 'Tap to drop the bundle.'
        },
        step3: {
            title: 'Keep Balance',
            description: 'Stack on centre to clear.'
        }
    },
    ui: {
        target: 'Target',
        bundles: 'Bundles',
        bundleCard: 'Current Ice Bundle',
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
