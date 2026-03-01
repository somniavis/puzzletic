const es = {
    title: 'Pop de 10 Marcos',
    subtitle: 'Domina la tabla del 9',
    description: 'Revienta la burbuja final y resuelve la tabla del 9.',
    howToPlay: {
        step1: { title: 'Revienta la ultima', description: 'Toca solo la ultima burbuja de cada fila.' },
        step2: { title: 'Evita errores', description: 'Las burbujas incorrectas quitan 1 vida.' },
        step3: { title: 'Elige la respuesta', description: 'Selecciona el resultado correcto.' }
    },
    ui: {
        popHint: 'Revienta las ultimas burbujas!'
    }
} as const;

export default es;
