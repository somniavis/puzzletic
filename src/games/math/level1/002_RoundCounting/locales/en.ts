export default {
    title: 'Round & Round Counting',
    sub: 'Find and Shuffle!',
    desc: 'Find the target items! The grid shuffles every time you find one.',
    howToPlay: {
        goal: { title: 'Goal', desc: 'Find all target items in the grid.' },
        shuffle: { title: 'Shuffle', desc: 'The grid shuffles after every correct find!' },
        time: { title: 'Time', desc: 'You have 60 seconds. Faster finds give more points.' },
        lives: { title: 'Lives', desc: 'You have 3 lives. Wrong clicks cost a life.' }
    },
    target: 'Find {{count}} {{emoji}}',
    shuffleMessage: 'Shuffling!',
    powerups: {
        freeze: 'Time Freeze!',
        life: 'Extra Life!',
        double: 'Double Score!'
    }
};
