export default {
    title: 'Jello Knight',
    headerStatsLabel: 'Jello Knight status',
    closeButton: 'Exit Jello Knight',
    joystickAriaLabel: 'Movement joystick',
    startTitle: 'Jello Knight',
    startDescription: 'Survive and rescue them all.',
    startButton: 'Start',
    controlsMoveShort: 'Move',
    controlsActionShort: 'Lv up & Rescue',
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
        waveDetails: {
            basic_mix: 'The first hunters split their pace. Read the chase.',
            heavy_lane: 'Heavy enemies lean into the lane. Keep moving.',
            rush_cross: 'Fast enemies rush in on crossing paths.',
            frontline_fire: 'A front line forms while ranged threats fire behind it.',
            crossfire_plus: 'Ranged pressure rises fast. Find a safe lane.',
            trex_gate: 'Tyrant Rex forces a direct breakthrough.',
            scorpion_gate: 'The scorpion cuts in fast. Watch the flanks.',
            fortress_crush: 'The fortress closes in with heavy pressure.',
            web_cross: 'Webs spread across the field. Choose your path.',
            climax_hunt: 'Every threat joins the hunt. Survive the clash.',
        },
        rangedTitle: 'Ranged Threat',
        rangedDetail: '{{name}} has entered the field.',
        eliteTitle: 'Elite Incoming',
        eliteDetail: '{{name}} has entered the arena.',
    },
    enemyNames: {
        standard: 'Imp',
        swift: 'Spore',
        heavy: 'Jelly Brute',
        pumpkin: 'Jack-o-Lantern',
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
        title: 'Game Over',
        retryButton: 'Play Again',
        newBest: 'New Best',
        records: {
            score: 'Score',
            survival: 'Survival',
            coins: 'Coins',
            peakDanger: 'Peak Wave',
            peakWaveSurvival: 'Peak Wave / Survival',
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
