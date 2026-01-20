import React, { useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Layout2 } from '../../../layouts/Standard/Layout2';
import { useGameEngine } from '../../../layouts/Standard/Layout0/useGameEngine';
import type { PowerUpBtnProps } from '../../../../components/Game/PowerUpBtn';
import { usePairUpLogic } from '../../level1/PairUpTwin/usePairUpLogic';
import { PairUpGrid } from '../../level1/PairUpTwin/PairUpGrid';
import { PairUpBackground } from '../../level1/PairUpTwin/PairUpBackground';
import type { GameManifest } from '../../../types';
import manifest_en from './locales/en';

const GAME_ID = 'pair-up-connect';

export const manifest: GameManifest = {
    id: GAME_ID,
    title: 'Pair Up! Connect',
    titleKey: 'games.pair-up-connect.title',
    subtitle: 'Find Related Pairs',
    subtitleKey: 'games.pair-up-connect.subtitle',
    description: 'Find logically related pairs of emojis.',
    descriptionKey: 'games.pair-up-connect.description',
    category: 'brain',
    level: 2,
    thumbnail: (
        <div style={{ position: 'relative', width: '100%', height: '100%' }}>
            <span style={{ position: 'absolute', top: '10%', left: '10%', fontSize: '1.6rem', lineHeight: 1 }}>🐒</span>
            <span style={{ position: 'absolute', bottom: '10%', right: '10%', fontSize: '1.6rem', lineHeight: 1 }}>🍌</span>
        </div>
    ),
    component: React.lazy(() => Promise.resolve({ default: PairUpConnect })),
};


const PairUpConnect: React.FC = () => {
    const navigate = useNavigate();
    const { t, i18n } = useTranslation();

    useEffect(() => {
        const newResources = { en: { translation: { games: { 'pair-up-connect': manifest_en } } } };
        Object.keys(newResources).forEach(lang => {
            i18n.addResourceBundle(lang, 'translation', newResources[lang as keyof typeof newResources].translation, true, true);
        });
    }, [i18n]);

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

    // Timer Bar Component (CSS Animation Optimized)
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
            {logic.gameState === 'preview' && (
                <div
                    key={logic.round} // Force re-mount to restart animation on new round
                    style={{
                        height: '100%',
                        background: '#f59e0b',
                        width: '100%',
                        animation: `timerShimmy ${logic.previewDuration}ms linear forwards`
                    }}
                />
            )}
            <style>{`
                @keyframes timerShimmy {
                    from { width: 100%; }
                    to { width: 0%; }
                }
            `}</style>
        </div>
    );

    return (
        <Layout2
            title={t('games.pair-up-connect.title')}
            subtitle={t('games.pair-up-connect.subtitle')}
            instructions={[
                {
                    title: t('games.pair-up-connect.howToPlay.step1.title'),
                    description: t('games.pair-up-connect.howToPlay.step1.description'),
                    icon: "🤔"
                },
                {
                    title: t('games.pair-up-connect.howToPlay.step2.title'),
                    description: t('games.pair-up-connect.howToPlay.step2.description'),
                    icon: "🔗"
                },
                {
                    title: t('games.pair-up-connect.howToPlay.step3.title'),
                    description: t('games.pair-up-connect.howToPlay.step3.description'),
                    icon: "✅"
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
