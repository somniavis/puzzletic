import base from './base';

const es = {
    ...base,
    title: 'Calendario de Vuelo',
    subtitle: 'Maestro del 7',
    question: '¿En cuántos días salimos?',
    howToPlay: {
        ...base.howToPlay,
        step2: { title: 'Llena el calendario', description: 'Toca domingo para llenar 1 semana.' },
        step3: { title: 'Elige la respuesta', description: '¿Cuántos días faltan?' }
    },
    ui: {
        tapEverySpotFirst: 'Toca el número correcto de domingos.'
    },
    weekdays: {
        mon: 'Lun',
        tue: 'Mar',
        wed: 'Mié',
        thu: 'Jue',
        fri: 'Vie',
        sat: 'Sáb',
        sun: 'Dom'
    },
    powerups: {
        timeFreeze: 'Congelar tiempo',
        extraLife: 'Vida extra',
        doubleScore: 'Puntos dobles'
    },
    a11y: {
        ladybug1: 'Mariquita 1',
        ladybug2: 'Mariquita 2',
        beetle: 'Escarabajo',
        cloverDot: 'Punto de trebol {{index}}'
    }
} as const;

export default es;
