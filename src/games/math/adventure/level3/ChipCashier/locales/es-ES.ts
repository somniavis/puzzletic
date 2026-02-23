const es = {
    title: 'Cajero de Monedas',
    subtitle: '¡Domina las tablas del 5 y del 10!',
    description: 'Elige cuántos paquetes para alcanzar el total objetivo.',
    powerups: {
        timeFreeze: 'Congelar',
        extraLife: 'Vida',
        doubleScore: 'Doble'
    },
    ui: {
        customerRequest: '¡Dame un total de {{target}} monedas!',
        coinLabel: 'moneda',
        bundleAria: 'paquete de {{size}} monedas',
        bundle5: 'Paquete de 5',
        bundle10: 'Paquete de 10',
        chooseCount: 'Elige paquetes',
        dropZone: 'Caja de monedas'
    },
    howToPlay: {
        step1: {
            title: 'Llega el cliente',
            description: 'Mira el total objetivo.'
        },
        step2: {
            title: 'Revisa la moneda',
            description: 'Comprueba si es 5 o 10.'
        },
        step3: {
            title: 'Elige la cantidad',
            description: 'Toca la cantidad correcta.'
        }
    }
} as const;

export default es;
