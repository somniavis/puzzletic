export default {
    lv1: {
        title: 'Multiplicación Inversa 1',
        subtitle: '1-digit x 1-digit',
    },
    lv2: {
        title: 'Multiplicación Inversa 2',
        subtitle: '2-digit x 1-digit',
    },
    lv3: {
        title: 'Multiplicación Inversa 3',
        subtitle: '3-digit x 1-digit',
    },
    lv4: {
        title: 'Multiplicación Inversa 4',
        subtitle: '2-digit x 2-digit',
        desc: 'Resuelve usando el método cruzado.'
    },
    description: '¡Calcula desde atrás usando productos parciales!',
    powerups: {
        timeFreeze: 'Congelar tiempo',
        extraLife: 'Vida extra',
        doubleScore: 'Puntuación doble',
    },
    howToPlay: {
        step1: { title: 'Unidades' },
        step2: { title: 'Decenas' },
        step3: { title: 'Total' },
        step3_hundreds: { title: 'Centenas' },
        step4: { title: 'Total' },
        // Lv3
        step3_cross1: { title: 'Paso cruzado 1' },
        step4_cross2: { title: 'Paso cruzado 2' },
        step5: { title: 'Total' },
        answer: { title: 'Respuesta' }
    },
    hint: {
        step1: 'Multiplica primero las unidades (1).',
        step2: 'Luego multiplica las decenas (10).',
        step3: '¡Suma los resultados!',
        step3_hundreds: 'Luego multiplica las centenas (100).',
        step4: '¡Suma los resultados!',
        // Lv3 Hints
        step1_lv3: 'Multiplica primero unidades × unidades.',
        step2_lv3: 'Luego multiplica decenas × decenas.',
        step3_cross1: 'Decenas arriba × unidades abajo (↘)',
        step4_cross2: 'Unidades arriba × decenas abajo (↙)',
        step5: '¡Suma todos los productos parciales!',
        answer: 'Introduce el resultado.'
    }
};
