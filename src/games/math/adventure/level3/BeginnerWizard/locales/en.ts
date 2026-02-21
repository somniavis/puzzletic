export default {
    title: 'Beginner Wizard',
    subtitle: 'Protect the animal family with magic!',
    description: 'Choose protect/remove magic to match the target.',
    ui: {
        targetLabel: 'Target'
    },
    howToPlay: {
        step1: {
            title: 'Check the target',
            description: 'Look at the number in the top target box.'
        },
        step2: {
            title: 'Choose magic',
            description: 'Pick protect (x1) or remove (x0) magic.'
        },
        step3: {
            title: 'Watch them move',
            description: 'The animal family moves by your spell.'
        }
    }
} as const;
