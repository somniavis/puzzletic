export default {
    title: 'Jello Knight',
    headerStatsLabel: 'Estado de Jello Knight',
    closeButton: 'Salir de Jello Knight',
    joystickAriaLabel: 'Joystick de movimiento',
    startTitle: 'Jello Knight',
    startDescription: 'Sobrevive y rescátalos a todos.',
    startButton: 'Comenzar',
    controlsMoveShort: 'Mover',
    controlsActionShort: 'Ataque automático',
    startGuides: {
        labels: {
            hud: 'HUD',
            move: 'MOVER',
            elite: 'ELITE',
        },
        hud: 'La vida, el XP y la puntuación siempre se muestran en la parte superior.',
        move: 'En PC te mueves con las flechas y en móvil con el joystick de la esquina inferior derecha.',
        elite: 'Los enemigos élite son peligrosos, pero al derrotarlos sueltan muchos orbes de rescate y XP.',
    },
    announcements: {
        dangerTitle: 'Oleada {{tier}}',
        dangerDetail1: 'Un nuevo grupo de enemigos se acerca.',
        dangerDetail2: 'Están apareciendo enemigos más fuertes.',
        dangerDetail3: 'El campo de batalla se vuelve más peligroso.',
        rangedTitle: 'Amenaza a Distancia',
        rangedDetail: '{{name}} ha entrado en el campo.',
        eliteTitle: 'Élite Entrante',
        eliteDetail: '{{name}} ha entrado en la arena.',
    },
    enemyNames: {
        standard: 'Duende',
        swift: 'Espora',
        heavy: 'Jalea Bruta',
        pumpkin: 'Calabaza Maldita',
        sniper: 'Ojo Vigía',
        heavyCaster: 'Ojo Maldito',
        brute: 'Rex Tirano',
        stinger: 'Escorpión Mortal',
        weaver: 'Tejedora',
    },
    levelUp: {
        eyebrow: 'Subida de Nivel',
        title: 'OBTÉN UNA HABILIDAD',
        unlockReady: 'Desbloquear',
    },
    gameOver: {
        title: 'Game Over',
        retryButton: 'Jugar de Nuevo',
        newBest: 'Nuevo Récord',
        records: {
            score: 'Puntuación',
            survival: 'Supervivencia',
            coins: 'Monedas',
            peakDanger: 'Oleada Máxima',
            peakWaveSurvival: 'Oleada Máxima / Supervivencia',
            peakDangerValue: 'Oleada {{tier}}',
        },
        rewards: {
            xp: 'XP',
            gro: 'Gro',
        },
    },
    header: {
        score: 'Puntuación',
        best: 'Récord',
    },
    upgrades: {
        orb_damage: {
            title: 'Poder del Orbe',
        },
        orb_count: {
            title: 'Cantidad de Orbes',
        },
        orb_speed: {
            title: 'Giro del Orbe',
        },
        orb_radius: {
            title: 'Radio del Orbe',
        },
        orb_crit: {
            title: 'Crítico del Orbe',
        },
        bomb_unlock: {
            title: 'Lanzar Bomba',
            description: 'Desbloquea la habilidad de bomba.',
        },
        bomb_chance: {
            title: 'Prob. de Bomba',
        },
        bomb_interval: {
            title: 'Intervalo de Bomba',
        },
        bomb_radius: {
            title: 'Radio de Bomba',
        },
        bomb_crit: {
            title: 'Crítico de Bomba',
        },
        player_hp: {
            title: 'Vida',
        },
        player_defense: {
            title: 'Defensa',
        },
        player_speed: {
            title: 'Velocidad',
        },
    },
};
