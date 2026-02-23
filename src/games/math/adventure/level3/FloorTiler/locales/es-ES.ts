const es = {
    title: 'Alicatador',
    subtitle: '¡Rellena las baldosas a la perfección!',
    description: 'Usa ancho y alto para hallar el área y rellenar las baldosas.',
    ui: {
        targetLabel: 'Baldosa',
        progress: '{{filled}}/{{total}}',
        dragHint: 'Arrastra por celdas vacías para pintar un rectángulo igual.',
        dragHintShort: 'Arrastra celdas vacías para igualar la baldosa.',
        boardComplete: '¡Genial! Pasando a la siguiente sala...'
    },
    howToPlay: {
        step1: {
            title: 'Mira la baldosa',
            description: 'Comprueba el tamaño a × b.'
        },
        step2: {
            title: 'Arrastra para pintar',
            description: 'Arrastra celdas vacías para igualar.'
        },
        step3: {
            title: 'Rellena el suelo',
            description: 'Rellena todas las celdas para superar.'
        }
    }
} as const;

export default es;
