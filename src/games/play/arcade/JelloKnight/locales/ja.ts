export default {
    title: 'ジェロナイト',
    headerStatsLabel: 'ジェロナイト状態',
    closeButton: 'ジェロナイトを終了',
    joystickAriaLabel: '移動ジョイスティック',
    startTitle: 'ジェロナイト',
    startDescription: '生き残ってみんなを助けよう。',
    startButton: 'スタート',
    controlsMoveShort: '移動',
    controlsActionShort: '自動攻撃',
    startGuides: {
        labels: {
            hud: 'HUD',
            move: 'MOVE',
            elite: 'ELITE',
        },
        hud: 'ライフ、XP、スコアは常に上部に表示されます。',
        move: 'PCでは矢印キー、モバイルでは右下のジョイスティックで移動します。',
        elite: 'エリート敵は危険ですが、倒すと大量のレスキューオーブとXPを落とします。',
    },
    announcements: {
        dangerTitle: 'WAVE {{tier}}',
        waveDetails: {
            basic_mix: '基本の追跡が始まります。速度差を読もう。',
            heavy_lane: '重い敵が道を押してきます。動き続けよう。',
            rush_cross: '速い敵が交差しながら押し寄せます。',
            frontline_fire: '前線が固まり、後ろから遠距離が狙います。',
            crossfire_plus: '遠距離の圧力が強まります。安全な道を探そう。',
            trex_gate: 'ティラノが正面から突破してきます。',
            scorpion_gate: 'サソリが素早く切り込みます。側面に注意。',
            fortress_crush: '要塞が狭まり、重い圧力が迫ります。',
            web_cross: 'クモの巣が広がります。進む道を選ぼう。',
            climax_hunt: 'すべての脅威が集結します。最後まで耐えよう。',
        },
        rangedTitle: '遠距離の脅威',
        rangedDetail: '{{name}}がフィールドに入ってきました。',
        eliteTitle: 'エリート出現',
        eliteDetail: '{{name}}がアリーナに出現しました。',
    },
    enemyNames: {
        standard: 'インプ',
        swift: 'スポア',
        heavy: 'ヘビージェリー',
        pumpkin: 'パンプキン',
        sniper: '監視の目',
        heavyCaster: '呪いの目',
        brute: 'ティラノ',
        stinger: 'デススコーピオン',
        weaver: 'ウェブウィーバー',
    },
    levelUp: {
        eyebrow: 'レベルアップ',
        title: 'スキル獲得',
        unlockReady: '解放',
    },
    gameOver: {
        title: 'ゲームオーバー',
        retryButton: 'もう一度',
        newBest: '新記録',
        records: {
            score: 'スコア',
            survival: '生存時間',
            coins: 'コイン',
            peakDanger: '最高ウェーブ',
            peakWaveSurvival: '最高ウェーブ / 生存時間',
            peakDangerValue: 'ウェーブ {{tier}}',
        },
        rewards: {
            xp: 'XP',
            gro: 'Gro',
        },
    },
    header: {
        score: 'スコア',
        best: 'ベスト',
    },
    upgrades: {
        orb_damage: {
            title: 'オーブ威力',
        },
        orb_count: {
            title: 'オーブ数',
        },
        orb_speed: {
            title: 'オーブ回転',
        },
        orb_radius: {
            title: 'オーブ範囲',
        },
        orb_crit: {
            title: 'オーブ会心',
        },
        bomb_unlock: {
            title: 'ボム習得',
            description: 'ボムスキルを解放します。',
        },
        bomb_chance: {
            title: 'ボム確率',
        },
        bomb_interval: {
            title: 'ボム間隔',
        },
        bomb_radius: {
            title: 'ボム範囲',
        },
        bomb_crit: {
            title: 'ボム会心',
        },
        player_hp: {
            title: 'ライフ',
        },
        player_defense: {
            title: '防御',
        },
        player_speed: {
            title: '移動速度',
        },
    },
};
