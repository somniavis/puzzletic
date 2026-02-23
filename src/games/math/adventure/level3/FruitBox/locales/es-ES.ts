const es = {
    title: 'Caja de Frutas',
    subtitle: '¡Empaqueta lotes iguales!',
    description: 'Coloca los mismos lotes de fruta en cada caja.',
    howToPlay: {
        step1: {
            title: 'Mira el pedido',
            description: 'Primero revisa la tarjeta de pedido.'
        },
        step2: {
            title: 'Arrastra lotes',
            description: 'Arrastra los lotes a las cajas.'
        },
        step3: {
            title: 'Hazlos iguales',
            description: 'Haz que todas las cajas queden iguales.'
        }
    },
    formulaHint: '¡Rellena todas las cajas!',
    ui: {
        orderGroupsUnit: ' grupos',
        orderEachUnit: ' cada uno',
        dragToBoxHint: '¡Arrastra frutas a las cajas!'
    },
    feedback: {
        fillAll: 'Primero rellena todas las cajas.',
        retry: 'Intenta de nuevo el mismo pedido.'
    }
} as const;

export default es;
