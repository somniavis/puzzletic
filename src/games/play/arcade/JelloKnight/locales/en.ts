export default {
    title: 'Jello Knight',
    headerStatsLabel: 'Jello Knight status',
    closeButton: 'Exit Jello Knight',
    joystickAriaLabel: 'Movement joystick',
    startTitle: 'Jello Knight',
    startDescription: 'Survive the arena, gather XP and rescue animals, and keep your score climbing as enemy waves, walls, and pressure rise together.',
    startButton: 'Start Run',
    startGuides: {
        labels: {
            hud: 'HUD',
            move: 'MOVE',
            elite: 'ELITE',
        },
        hud: 'Life, XP, and score stay visible at the top.',
        move: 'Desktop movement works with arrow keys, and mobile uses the bottom-right joystick.',
        elite: 'Elite enemies are dangerous, but rescuing them drops a big burst of score items and XP.',
    },
    announcements: {
        dangerTitle: 'Wave {{tier}}',
        dangerDetail1: 'A new enemy group is rushing in.',
        dangerDetail2: 'Stronger enemies are appearing.',
        dangerDetail3: 'The battlefield is getting more dangerous.',
        rangedTitle: 'Ranged Threat',
        rangedDetail: '{{name}} has entered the field.',
        eliteTitle: 'Elite Incoming',
        eliteDetail: '{{name}} has entered the arena.',
    },
    enemyNames: {
        standard: 'Imp',
        swift: 'Spore',
        heavy: 'Jelly Brute',
        sniper: 'Watcher Eye',
        heavyCaster: 'Curse Eye',
        brute: 'Tyrant Rex',
        stinger: 'Death Scorpion',
        weaver: 'Web Weaver',
    },
    levelUp: {
        eyebrow: 'Level Up',
        title: 'GET A SKILL',
        unlockReady: 'Unlock',
    },
    gameOver: {
        title: 'Run Results',
        retryButton: 'Play Again',
        newBest: 'New Best',
        records: {
            score: 'Score',
            survival: 'Survival',
            coins: 'Coins',
            peakDanger: 'Peak Wave',
            peakDangerValue: 'Wave {{tier}}',
        },
        rewards: {
            xp: 'XP',
            gro: 'Gro',
        },
    },
    header: {
        score: 'Score',
        best: 'Best',
    },
    upgrades: {
        orb_damage: {
            title: 'Orb Power',
        },
        orb_count: {
            title: 'Orb Count',
        },
        orb_speed: {
            title: 'Orb Spin',
        },
        orb_radius: {
            title: 'Orb Radius',
        },
        orb_crit: {
            title: 'Orb Critical',
        },
        bomb_unlock: {
            title: 'Bomb Drop',
            description: 'Unlock the bomb skill.',
        },
        bomb_chance: {
            title: 'Bomb Chance',
        },
        bomb_interval: {
            title: 'Bomb Interval',
        },
        bomb_radius: {
            title: 'Bomb Radius',
        },
        bomb_crit: {
            title: 'Bomb Critical',
        },
        player_hp: {
            title: 'Life',
        },
        player_defense: {
            title: 'Defense',
        },
        player_speed: {
            title: 'Move Speed',
        },
    },
};
