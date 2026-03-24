const es = {
    title: 'Cruce del Río',
    subtitle: 'Encuentra las piedras correctas',
    description: 'Elige solo las piedras de división que coincidan con el número objetivo y cruza hasta la meta.',
    powerups: {
        timeFreeze: 'Congelar tiempo',
        extraLife: 'Vida extra',
        doubleScore: 'Puntuación doble'
    },
    ui: {
        placeholderTitle: 'Cruza el río con expresiones correctas',
        placeholderBody: 'Elige solo las piedras de división que coincidan con el número objetivo y ve del inicio a la meta.',
        targetLabel: 'Meta',
        startLabel: 'Inicio',
        goalLabel: 'Meta',
        boardAriaLabel: 'Tablero de Cruce del Río',
        moveHint: 'Una piedra a la vez'
    },
    howToPlay: {
        step1: { title: 'Revisa la meta', description: 'Busca el mismo valor' },
        step2: { title: 'Avanza un paso', description: 'Solo piedras cercanas' },
        step3: { title: 'Llega a la meta', description: 'Piedra mala, caes' }
    }
} as const;

export default es;
