const es = {
    title: 'Ataque del Trol',
    subtitle: '¡Defiende el castillo!',
    description: 'Detén al trol con la bala de cañón correcta.',
    howToPlay: {
        step1: {
            title: 'Se acerca el trol',
            description: 'Mira la ecuación.'
        },
        step2: {
            title: 'Carga la bomba',
            description: 'Elige la bomba con el número correcto.'
        },
        step3: {
            title: '¡Dispara!',
            description: 'Arrástrala al cañón y dispara.'
        }
    },
    ui: {
        dragHint: '¡Arrastra una bomba al cañón!',
        dragOverlayHint: '¡Arrastra una bomba al cañón!',
        dropHint: '¡Suelta aquí para disparar!',
        underHit: '¡Demasiado débil! El trol está cargando.',
        overHit: '¡Demasiado fuerte! El trol lo bloqueó.',
        correctHit: '¡Impacto directo! Trol derrotado.',
        castleHit: '¡Un trol llegó al castillo! Perdiste 1 vida.'
    }
} as const;

export default es;
