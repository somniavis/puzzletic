const omokEn = {
    title: 'Omok',
    subtitle: 'Five in a Row',
    description: 'Connect 5 stones to win against the AI!',
    howToPlay: {
        step1: {
            title: 'Place a Stone',
            description: 'Tap an intersection to place your stone.'
        },
        step2: {
            title: 'Block the AI',
            description: "Stop AI's line before it reaches 5."
        },
        step3: {
            title: 'Make 5 in a Row',
            description: 'Connect 5 stones first to win.'
        }
    },
    status: {
        playerTurn: 'Your Turn',
        aiTurn: 'AI is thinking...',
        win: 'You Win!',
        lose: 'You Lost...',
        draw: 'Draw!'
    },
    ui: {
        guideHint: 'Make 5 in a row before AI!'
    }
};

export default omokEn;
