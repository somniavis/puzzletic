const en = {
    title: 'Attaque du troll',
    subtitle: 'Défends le château !',
    description: 'Arrête le troll avec le bon boulet.',
    howToPlay: {
        step1: {
            title: 'Le troll arrive',
            description: "Regarde l'équation."
        },
        step2: {
            title: 'Charge la bombe',
            description: 'Choisis la bombe avec le bon nombre.'
        },
        step3: {
            title: 'Feu !',
            description: 'Glisse vers le canon et tire.'
        }
    },
    ui: {
        dragHint: 'Glisse une bombe vers le canon !',
        dragOverlayHint: 'Glisse une bombe vers le canon !',
        dropHint: 'Dépose ici pour tirer !',
        underHit: 'Trop faible ! Le troll charge.',
        overHit: 'Trop fort ! Le troll a bloqué.',
        correctHit: 'Touché direct ! Troll vaincu.',
        castleHit: 'Un troll a atteint le château ! Tu perds 1 vie.'
    }
} as const;

export default en;
