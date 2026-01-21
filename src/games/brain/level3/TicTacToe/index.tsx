import React from 'react';
import { Layout1 } from '../../../layouts/Standard/Layout1';
import { useGameEngine } from '../../../layouts/Standard/Layout0/useGameEngine';
import { useTranslation } from 'react-i18next';
import styles from './TicTacToe.module.css';
import { TicTacToeGame } from './TicTacToeGame';

const WaveBackground = () => {
    return (
        <div className={styles.waveBgContainer}>
            <div className={styles.wave}></div>
            <div className={styles.wave}></div>
            <div className={styles.wave}></div>
        </div>
    );
};

export const TicTacToe: React.FC = () => {
    const { t } = useTranslation();

    // Engine Config for Scaffolding
    const engine = useGameEngine({
        initialLives: 3,
        initialTime: 90, // 90 seconds limit
        maxDifficulty: 3
    });

    const instructions = [
        {
            icon: '❌⭕',
            title: t('games.tic-tac-toe.instructions.rule1.title'),
            description: t('games.tic-tac-toe.instructions.rule1.desc')
        },
        {
            icon: '🛡️',
            title: t('games.tic-tac-toe.instructions.rule2.title'),
            description: t('games.tic-tac-toe.instructions.rule2.desc')
        },
    ];

    return (
        <Layout1
            gameId="tic-tac-toe"
            title={t('games.tic-tac-toe.title')}
            subtitle={t('games.tic-tac-toe.subtitle')}
            description={t('games.tic-tac-toe.description')}
            instructions={instructions}
            engine={engine}
            onExit={() => window.history.back()}
            cardBackground={<WaveBackground />}
        >
            <TicTacToeGame engine={engine} />
        </Layout1>
    );
};

export default TicTacToe;
