import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Layout2 } from '../../../../layouts/Standard/Layout2';
import { useGameEngine } from '../../../../layouts/Standard/Layout0/useGameEngine';
import { GameIds } from '../../../../../constants/gameIds';
import { useRocketLauncherLogic } from './useRocketLauncherLogic';
import { GameLogic } from './GameLogic';
import type { PowerUpBtnProps } from '../../../../../components/Game/PowerUpBtn';

const GAME_ID = GameIds.MATH_ROCKET_LAUNCHER;

export default function RocketLauncher() {
    const navigate = useNavigate();
    const { t } = useTranslation();

    const engine = useGameEngine({
        initialLives: 3,
        initialTime: 60,
        maxDifficulty: 3
    });

    const controller = useRocketLauncherLogic(engine);
    const { powerUps, usePowerUp, isTimeFrozen, doubleScoreActive } = controller;

    const instructions = [
        { icon: '🚀', title: t('games.rocketLauncher.howToPlay.step1.title'), description: t('games.rocketLauncher.howToPlay.step1.desc') },
        { icon: '🤔', title: t('games.rocketLauncher.howToPlay.step2.title'), description: t('games.rocketLauncher.howToPlay.step2.desc') },
        { icon: '👆', title: t('games.rocketLauncher.howToPlay.step3.title'), description: t('games.rocketLauncher.howToPlay.step3.desc') }
    ];

    const powerUpConfig = useMemo<PowerUpBtnProps[]>(() => [
        {
            count: powerUps.timeFreeze,
            color: "blue",
            icon: "❄️",
            title: "Time Freeze",
            onClick: () => usePowerUp('timeFreeze'),
            disabledConfig: isTimeFrozen,
            status: isTimeFrozen ? 'active' : 'normal'
        },
        {
            count: powerUps.extraLife,
            color: "red",
            icon: "❤️",
            title: "Extra Life",
            onClick: () => usePowerUp('extraLife'),
            disabledConfig: engine.lives >= 3,
            status: engine.lives >= 3 ? 'maxed' : 'normal'
        },
        {
            count: powerUps.doubleScore,
            color: "yellow",
            icon: "⚡",
            title: "Double Score",
            onClick: () => usePowerUp('doubleScore'),
            disabledConfig: doubleScoreActive,
            status: doubleScoreActive ? 'active' : 'normal'
        }
    ], [powerUps, isTimeFrozen, engine.lives, doubleScoreActive, usePowerUp]);

    return (
        <Layout2
            title={t('games.rocketLauncher.title')}
            subtitle={t('games.rocketLauncher.subtitle')}
            gameId={GAME_ID}
            engine={engine}
            onExit={() => navigate(-1)}
            instructions={instructions}
            powerUps={powerUpConfig}
            cardBackground={<div style={{ width: '100%', height: '100%', background: 'linear-gradient(to bottom, #0f172a, #1e293b)' }} />}
        >
            <GameLogic controller={controller} />
        </Layout2>
    );
}
