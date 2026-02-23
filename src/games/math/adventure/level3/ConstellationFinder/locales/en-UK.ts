const en = {
    title: 'Constellation Finder',
    subtitle: 'Light up the stars!',
    description: 'Solve 1-digit multiplication and complete each constellation set.',
    howToPlay: {
        step1: {
            title: 'Check Equation',
            description: 'Solve the equation.'
        },
        step2: {
            title: 'Light the Star',
            description: 'Tap the correct star.'
        },
        step3: {
            title: 'Complete the Set',
            description: 'Light all stars, then check.'
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
        clickCorrectStarHint: 'Tap the correct star!',
        solveGuide: 'Find the correct star answer.',
        solveGuideSub: 'Wrong tap costs 1 life. Correct tap lights the star.',
        clearedTitle: '{{name}} complete!',
        clearedSub: 'Press check to move to the next set.'
    }
} as const;

export default en;
