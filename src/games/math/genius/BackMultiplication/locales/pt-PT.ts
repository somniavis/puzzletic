export default {
    lv1: {
        title: 'Multiplicação por Trás 1',
        subtitle: '1 dígito x 1 dígito',
    },
    lv2: {
        title: 'Multiplicação por Trás 2',
        subtitle: '2 dígitos x 1 dígito',
    },
    lv3: {
        title: 'Multiplicação por Trás 3',
        subtitle: '3 dígitos x 1 dígito',
    },
    lv4: {
        title: 'Multiplicação por Trás 4',
        subtitle: '2 dígitos x 2 dígitos',
        desc: 'Resolve usando o método de ligação cruzada.'
    },
    description: 'Calcula por trás usando produtos parciais!',
    powerups: {
        timeFreeze: 'Congelar Tempo',
        extraLife: 'Vida Extra',
        doubleScore: 'Pontuação a Dobrar',
    },
    howToPlay: {
        step1: { title: 'Unidades' },
        step2: { title: 'Dezenas' },
        step3: { title: 'Total' },
        step3_hundreds: { title: 'Centenas' },
        step4: { title: 'Total' },
        // Lv3
        step3_cross1: { title: 'Passo Cruzado 1' },
        step4_cross2: { title: 'Passo Cruzado 2' },
        step5: { title: 'Total' },
        answer: { title: 'Resposta' }
    },
    hint: {
        step1: 'Multiplica primeiro as unidades (1s).',
        step2: 'Multiplica depois as dezenas (10s).',
        step3: 'Soma os resultados!',
        step3_hundreds: 'Multiplica depois as centenas (100s).',
        step4: 'Soma os resultados!',
        // Lv3 Hints
        step1_lv3: 'Multiplica primeiro unidades x unidades.',
        step2_lv3: 'Multiplica depois dezenas x dezenas.',
        step3_cross1: 'Dezenas de cima x Unidades de baixo (↘)',
        step4_cross2: 'Unidades de cima x Dezenas de baixo (↙)',
        step5: 'Soma todos os produtos parciais!',
        answer: 'Introduz o resultado.'
    }
};
