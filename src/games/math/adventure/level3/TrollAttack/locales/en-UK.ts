const en = {
    title: 'Dumb Troll Attack',
    subtitle: 'Defend the Castle!',
    description: 'Stop the troll with the correct cannonball.',
    howToPlay: {
        step1: {
            title: 'Troll Incoming',
            description: 'Look at the equation.'
        },
        step2: {
            title: 'Load the Bomb',
            description: 'Pick the right number bomb.'
        },
        step3: {
            title: 'Fire!',
            description: 'Drag to the cannon and fire.'
        }
    },
    ui: {
        dragHint: 'Drag a bomb to the cannon!',
        dragOverlayHint: 'Drag a bomb to the cannon!',
        dropHint: 'Drop here to fire!',
        underHit: 'Too weak! The troll is charging.',
        overHit: 'Too strong! The troll blocked it.',
        correctHit: 'Direct hit! Troll defeated.',
        castleHit: 'A troll reached the castle! You lost 1 life.'
    }
} as const;

export default en;
