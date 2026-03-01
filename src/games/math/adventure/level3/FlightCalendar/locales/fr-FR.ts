import base from './base';

const fr = {
    ...base,
    title: 'Calendrier de Vol',
    subtitle: 'Maitre des 7',
    question: 'Dans combien de jours part-on ?',
    howToPlay: {
        ...base.howToPlay,
        step2: { title: 'Remplis le calendrier', description: 'Tape dimanche pour remplir 1 semaine.' },
        step3: { title: 'Choisis la réponse', description: 'Combien de jours restent ?' }
    },
    ui: {
        tapEverySpotFirst: 'Tape le bon nombre de dimanches.'
    },
    weekdays: {
        mon: 'Lun',
        tue: 'Mar',
        wed: 'Mer',
        thu: 'Jeu',
        fri: 'Ven',
        sat: 'Sam',
        sun: 'Dim'
    },
    powerups: {
        timeFreeze: 'Temps fige',
        extraLife: 'Vie en plus',
        doubleScore: 'Score x2'
    },
    a11y: {
        ladybug1: 'Coccinelle 1',
        ladybug2: 'Coccinelle 2',
        beetle: 'Scarabee',
        cloverDot: 'Point de trefle {{index}}'
    }
} as const;

export default fr;
