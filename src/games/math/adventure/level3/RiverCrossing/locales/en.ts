const en = {
    title: 'River Crossing',
    subtitle: 'Correct Stepping Stones',
    description: 'Choose only the division stepping stones that match the target number and move from the start to the goal.',
    powerups: {
        timeFreeze: 'Time Freeze',
        extraLife: 'Extra Life',
        doubleScore: 'Double Score'
    },
    ui: {
        placeholderTitle: 'Cross the river on correct expressions',
        placeholderBody: 'Choose only the division stones that match the target number and move from start to goal.',
        targetLabel: 'Target',
        startLabel: 'Start',
        goalLabel: 'Goal',
        boardAriaLabel: 'River Crossing board',
        moveHint: 'One stone at a time!'
    },
    howToPlay: {
        step1: { title: 'Check the target', description: 'Find the same value' },
        step2: { title: 'Move one step at a time', description: 'Only nearby stones' },
        step3: { title: 'Reach the goal', description: 'Wrong stone, fall' }
    }
} as const;

export default en;
