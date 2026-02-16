const en = {
    title: 'Constellation Finder',
    subtitle: 'Light up the stars!',
    description: 'Solve 1-digit multiplication and complete each constellation set.',
    howToPlay: {
        step1: {
            title: 'Read the Mission',
            description: 'Check the multiplication question on top.'
        },
        step2: {
            title: 'Tap the Right Star',
            description: 'Find the star with the correct answer.'
        },
        step3: {
            title: 'Finish the Set',
            description: 'Light all target stars, then press check.'
        }
    },
    difficulty: {
        low: 'Easy',
        mid: 'Medium',
        high: 'Hard',
        top: 'Very Hard'
    },
    sets: {
        northDipper: 'Big Dipper',
        january: 'January · Capricorn',
        february: 'February · Aquarius',
        march: 'March · Pisces',
        april: 'April · Aries',
        may: 'May · Taurus',
        june: 'June · Gemini',
        july: 'July · Cancer',
        august: 'August · Leo',
        september: 'September · Virgo',
        october: 'October · Libra',
        november: 'November · Scorpio',
        december: 'December · Sagittarius'
    },
    ui: {
        setLabel: 'Set {{current}}/{{total}}',
        solveGuide: 'Find the correct star answer.',
        solveGuideSub: 'Wrong tap costs 1 life. Correct tap lights the star.',
        clearedTitle: '{{name}} complete!',
        clearedSub: 'Press check to move to the next set.'
    }
} as const;

export default en;
