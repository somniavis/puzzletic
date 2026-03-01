import base from './base';

const en = {
    ...base,
    howToPlay: {
        ...base.howToPlay,
        step2: { title: 'Fill the Calendar', description: 'Tap Sunday to fill one week.' },
        step3: { title: 'Pick the Answer', description: 'Choose the days left.' }
    }
} as const;

export default en;
