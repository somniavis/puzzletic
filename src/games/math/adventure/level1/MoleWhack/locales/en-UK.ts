const locale = {
    title: 'Mice Whack',
    subtitle: 'Catch the Mice!',
    description: 'ㅇㅇㅇ',
    powerups: {
        timeFreeze: 'ㅇㅇㅇ',
        extraLife: 'ㅇㅇㅇ',
        doubleScore: 'ㅇㅇㅇ'
    },
    ui: {
        placeholder: 'ㅇㅇㅇ',
        restrictedSign: 'CATCH MICE!',
        tapHint: 'Tap the mice!'
    },
    howToPlay: {
        step1: { title: 'Mice Pop Up!', description: 'Find the right mouse.' },
        step2: { title: 'Find the Right Mouse', description: 'Tap only correct mice.' },
        step3: { title: 'Whack, Whack!', description: 'Catch enough to clear.' }
    }
} as const;

export default locale;
