const manifest = {
    title: "Corta Frutas",
    subtitle: "¡Corta la respuesta!",
    description: "Calcula el número que falta y corta la fruta para preparar un tentempié saludable.",
    howToPlay: {
        step1: {
            title: "¿Cuántos cortes?",
            description: "Decide primero el número."
        },
        step2: {
            title: "Elige el cuchillo",
            description: "Elige el número correcto."
        },
        step3: {
            title: "Corta la fruta",
            description: "Corta para enviar."
        }
    },
    ui: {
        dragSliceHint: '¡Arrastra el cuchillo para cortar!'
    },
    powerups: {
        freeze: "Congelar tiempo",
        life: "Vida extra",
        double: "Puntuación x2"
    }
};

export default manifest;
