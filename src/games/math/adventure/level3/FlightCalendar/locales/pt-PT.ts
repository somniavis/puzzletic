import base from './base';

const pt = {
    ...base,
    title: 'Calendario de Voo',
    subtitle: 'Mestre do 7',
    question: 'Em quantos dias partimos?',
    howToPlay: {
        ...base.howToPlay,
        step2: { title: 'Preenche o Calendário', description: 'Toca em domingo para preencher 1 semana.' },
        step3: { title: 'Escolhe a Resposta', description: 'Quantos dias faltam?' }
    },
    ui: {
        tapEverySpotFirst: 'Toca no número correto de domingos.'
    },
    weekdays: {
        mon: 'Seg',
        tue: 'Ter',
        wed: 'Qua',
        thu: 'Qui',
        fri: 'Sex',
        sat: 'Sáb',
        sun: 'Dom'
    },
    powerups: {
        timeFreeze: 'Congelar tempo',
        extraLife: 'Vida extra',
        doubleScore: 'Pontuacao dupla'
    },
    a11y: {
        ladybug1: 'Joaninha 1',
        ladybug2: 'Joaninha 2',
        beetle: 'Besouro',
        cloverDot: 'Ponto do trevo {{index}}'
    }
} as const;

export default pt;
