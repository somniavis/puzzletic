const manifest = {
    title: 'Matriz Neón',
    subtitle: '¡Domina la tabla del 8!',
    description: 'Un puzzle de velocidad para dominar el patrón final del 8.',
    powerups: {
        timeFreeze: 'Congelar',
        extraLife: 'Vida',
        doubleScore: 'Doble'
    },
    ui: {
        tapHint: 'Toca 8, 6, 4, 2 o 0 para completar.',
        dragDropHint: 'Toca 8, 6, 4, 2 o 0 para completar.',
        patternHint: '¡Recuerda 8-6-4-2-0!',
        signTitle: 'Código secreto de la tabla del 8',
        signCode: '8-6-4-2-0',
        cellLabel: '8x{{index}}',
        cellAriaLabel: 'Celda de matriz {{index}}',
        modePattern: 'Carril de Patrón',
        modeVertical: 'Emparejamiento Vertical'
    },
    howToPlay: {
        step1: {
            title: '8-6-4-2-0!',
            description: 'Recuerda el patrón.'
        },
        step2: {
            title: 'Ingresa dígitos',
            description: 'Toca los números correctos.'
        },
        step3: {
            title: 'Set completo',
            description: '¡Sube el combo!'
        }
    }
} as const;

export default manifest;
