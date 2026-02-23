const en = {
    title: 'Floor Tiler',
    subtitle: 'Fill the tiles perfectly!',
    description: 'Use width and height to find area and fill the tiles.',
    ui: {
        targetLabel: 'Tile',
        progress: '{{filled}}/{{total}}',
        dragHint: 'Drag on empty cells to paint a matching rectangle.',
        dragHintShort: 'Drag empty cells to match the tile.',
        boardComplete: 'Great! Moving to the next room...'
    },
    howToPlay: {
        step1: {
            title: 'Check the Tile',
            description: 'See the a × b size.'
        },
        step2: {
            title: 'Drag to Paint',
            description: 'Drag empty cells to match.'
        },
        step3: {
            title: 'Fill the Floor',
            description: 'Fill all cells to clear.'
        }
    }
} as const;

export default en;
