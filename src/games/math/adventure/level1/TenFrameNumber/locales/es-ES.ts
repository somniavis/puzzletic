const manifest = {
    title: 'Número de 10 cuadros',
    subtitle: 'Cuenta rápido, piensa en decenas',
    description: 'ㅇㅇㅇ',
    powerups: {
        timeFreeze: 'ㅇㅇㅇ',
        extraLife: 'ㅇㅇㅇ',
        doubleScore: 'ㅇㅇㅇ'
    },
    ui: {
        placeholder: 'ㅇㅇㅇ',
        howManyHint: '¿cuántos?'
    },
    howToPlay: {
        step1: { title: 'Mira las cartas', description: 'Cuenta los puntos azules o rojos.' },
        step2: { title: 'Elige el número', description: 'Toca la respuesta correcta.' },
        step3: { title: 'Completa series', description: 'Encadena aciertos y gana potenciadores.' }
    }
} as const;

export default manifest;
