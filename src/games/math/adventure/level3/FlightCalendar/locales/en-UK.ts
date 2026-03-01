import base from './base';

const enUK = {
    ...base,
    howToPlay: {
        ...base.howToPlay,
        step2: { title: 'Fill the Calendar', description: 'Tap Sunday to fill one week.' },
        step3: { title: 'Pick the Answer', description: 'Choose the days left.' }
    },
    a11y: {
        ...base.a11y,
        ladybug1: 'Ladybird 1',
        ladybug2: 'Ladybird 2'
    }
} as const;

export default enUK;
