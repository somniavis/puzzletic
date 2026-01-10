import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout2 } from '../../../layouts/Standard/Layout2';
import { useGameEngine } from '../../../layouts/Standard/Layout0/useGameEngine';
import type { PowerUpBtnProps } from '../../../../components/Game/PowerUpBtn';
import { usePairUpLogic } from '../../level1/PairUpTwin/usePairUpLogic';
import { PairUpGrid } from '../../level1/PairUpTwin/PairUpGrid';
import { PairUpBackground } from '../../level1/PairUpTwin/PairUpBackground';
import type { GameManifest } from '../../../types';

const GAME_ID = 'pair-up-connect';

export const manifest: GameManifest = {
    id: GAME_ID,
    title: 'Pair Up! Connect',
    subtitle: 'Link Related Items',
    description: 'Find logically related pairs of emojis.',
    category: 'brain',
    level: 2,
    thumbnail: 'https://pub-1411335941ed4406b5f667f40e04a814.r2.dev/thumbnails/pair-up-connect.png',
    component: React.lazy(() => Promise.resolve({ default: PairUpConnect })),
};


const PairUpConnect: React.FC = () => {
    const navigate = useNavigate();

    // Engine Config will be refined later
    const engine = useGameEngine({
        initialTime: 90,
        initialLives: 3,
    });

    const powerUps: PowerUpBtnProps[] = useMemo(() => [
        {
            count: engine.powerUps.timeFreeze,
            icon: '❄️',
            color: 'blue' as const,
            onClick: () => engine.activatePowerUp('timeFreeze'),
            status: engine.isTimeFrozen ? 'active' : 'normal',
            title: 'Time Freeze',
            disabledConfig: engine.isTimeFrozen || engine.powerUps.timeFreeze <= 0
        },
        {
            count: engine.powerUps.extraLife,
            icon: '❤️',
            color: 'red' as const,
            onClick: () => engine.activatePowerUp('extraLife'),
            status: engine.lives >= 3 ? 'maxed' : 'normal',
            title: 'Extra Life',
            disabledConfig: engine.lives >= 3 || engine.powerUps.extraLife <= 0
        },
        {
            count: engine.powerUps.doubleScore,
            icon: '⚡',
            color: 'yellow' as const,
            onClick: () => engine.activatePowerUp('doubleScore'),
            status: engine.isDoubleScore ? 'active' : 'normal',
            title: 'Double Score',
            disabledConfig: engine.isDoubleScore || engine.powerUps.doubleScore <= 0
        }
    ], [engine.powerUps, engine.isTimeFrozen, engine.isDoubleScore, engine.activatePowerUp, engine.lives]);

    // --- Game Logic ---
    const logic = usePairUpLogic(engine, 'connect');

    // Timer Bar Component (Injected to Left of PowerUps)
    const timerBar = (
        <div style={{
            width: '150px',
            height: '8px',
            background: 'rgba(0,0,0,0.1)',
            borderRadius: '99px',
            overflow: 'hidden',
            opacity: logic.gameState === 'preview' ? 1 : 0,
            transition: 'opacity 0.3s'
        }}>
            <div style={{
                height: '100%',
                width: `${logic.previewProgress}%`,
                background: '#f59e0b',
                transition: 'width 0.1s linear'
            }} />
        </div>
    );

    return (
        <Layout2
            title="Pair Up! Connect"
            subtitle="Link Related Items"
            instructions={[
                {
                    title: "Memorize",
                    description: "Remember the card locations in 3 seconds.",
                    icon: "👀"
                },
                {
                    title: "Find Pairs",
                    description: "Flip cards to find connected items.",
                    icon: "🔗"
                },
                {
                    title: "Clear Grid",
                    description: "Match all pairs to win!",
                    icon: "✨"
                }
            ]}
            engine={engine}
            onExit={() => navigate(-1)}
            powerUps={powerUps}
            subHeaderRight={timerBar}
            cardBackground={<PairUpBackground />}
        >
            <PairUpGrid
                cards={logic.cards}
                config={logic.gridConfig}
                onCardClick={logic.handleCardClick}
            />
        </Layout2>
    );
};

export default PairUpConnect;
