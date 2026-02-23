import React, { useMemo, useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Layout2 } from '../../../layouts/Standard/Layout2';
import { useGameEngine } from '../../../layouts/Standard/Layout0/useGameEngine';
import type { PowerUpBtnProps } from '../../../../components/Game/PowerUpBtn';
import { usePairUpLogic } from './usePairUpLogic';
import { PairUpGrid } from './PairUpGrid';
import { PairUpBackground } from './PairUpBackground';
import styles from './PairUpTwin.module.css';
import type { GameManifest } from '../../../types';
import manifest_en from './locales/en';

import { GameIds } from '../../../../constants/gameIds';
const GAME_ID = GameIds.PAIR_UP_TWIN;

export const manifest: GameManifest = {
    id: GAME_ID,
    title: 'Pair Up! Twin',
    titleKey: 'games.pair-up-twin.title',
    subtitle: 'Find Matching Pairs',
    subtitleKey: 'games.pair-up-twin.subtitle',
    description: 'Find identical pairs of emojis.',
    descriptionKey: 'games.pair-up-twin.description',
    category: 'brain',
    level: 1,
    thumbnail: '👯',
    component: React.lazy(() => Promise.resolve({ default: PairUpTwin })),
};


const PairUpTwin: React.FC = () => {
    const navigate = useNavigate();
    const { t, i18n } = useTranslation();

    useEffect(() => {
        const newResources = { en: { translation: { games: { 'pair-up-twin': manifest_en } } } };
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
            title: t('games.pair-up-twin.powerups.timeFreeze'),
            disabledConfig: engine.isTimeFrozen || engine.powerUps.timeFreeze <= 0
        },
        {
            count: engine.powerUps.extraLife,
            icon: '❤️',
            color: 'red' as const,
            onClick: () => engine.activatePowerUp('extraLife'),
            status: engine.lives >= 3 ? 'maxed' : 'normal',
            title: t('games.pair-up-twin.powerups.extraLife'),
            disabledConfig: engine.lives >= 3 || engine.powerUps.extraLife <= 0
        },
        {
            count: engine.powerUps.doubleScore,
            icon: '⚡',
            color: 'yellow' as const,
            onClick: () => engine.activatePowerUp('doubleScore'),
            status: engine.isDoubleScore ? 'active' : 'normal',
            title: t('games.pair-up-twin.powerups.doubleScore'),
            disabledConfig: engine.isDoubleScore || engine.powerUps.doubleScore <= 0
        }
    ], [engine.powerUps, engine.isTimeFrozen, engine.isDoubleScore, engine.activatePowerUp, engine.lives, t]);

    // --- Game Logic ---
    const logic = usePairUpLogic(engine, 'twin');
    const [showTapMatchHint, setShowTapMatchHint] = useState(false);
    const [isTapMatchHintExiting, setIsTapMatchHintExiting] = useState(false);
    const hasShownTapMatchHintRef = useRef(false);
    const tapMatchHintTimerRef = useRef<number | null>(null);
    const tapMatchHintExitTimerRef = useRef<number | null>(null);

    useEffect(() => {
        const isFirstProblem = logic.round === 1 && engine.stats.correct === 0 && engine.stats.wrong === 0;
        if (engine.gameState !== 'playing') {
            if (engine.gameState === 'gameover' || engine.gameState === 'idle') {
                setShowTapMatchHint(false);
                setIsTapMatchHintExiting(false);
                hasShownTapMatchHintRef.current = false;
            }
            return;
        }
        if (!isFirstProblem || hasShownTapMatchHintRef.current) return;

        hasShownTapMatchHintRef.current = true;
        setShowTapMatchHint(true);
        setIsTapMatchHintExiting(false);

        tapMatchHintTimerRef.current = window.setTimeout(() => {
            setIsTapMatchHintExiting(true);
            tapMatchHintExitTimerRef.current = window.setTimeout(() => {
                setShowTapMatchHint(false);
                setIsTapMatchHintExiting(false);
                tapMatchHintExitTimerRef.current = null;
            }, 220);
            tapMatchHintTimerRef.current = null;
        }, 1800);
    }, [engine.gameState, engine.stats.correct, engine.stats.wrong, logic.round]);

    useEffect(() => {
        return () => {
            if (tapMatchHintTimerRef.current != null) {
                window.clearTimeout(tapMatchHintTimerRef.current);
                tapMatchHintTimerRef.current = null;
            }
            if (tapMatchHintExitTimerRef.current != null) {
                window.clearTimeout(tapMatchHintExitTimerRef.current);
                tapMatchHintExitTimerRef.current = null;
            }
        };
    }, []);

    // Timer Bar Component (CSS Animation Optimized)
    const timerBar = (
        <div style={{
            width: '100px',
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
            title={t('games.pair-up-twin.title')}
            subtitle={t('games.pair-up-twin.subtitle')}
            instructions={[
                {
                    title: t('games.pair-up-twin.howToPlay.step1.title'),
                    description: t('games.pair-up-twin.howToPlay.step1.description'),
                    icon: "👀"
                },
                {
                    title: t('games.pair-up-twin.howToPlay.step2.title'),
                    description: t('games.pair-up-twin.howToPlay.step2.description'),
                    icon: "🃏"
                },
                {
                    title: t('games.pair-up-twin.howToPlay.step3.title'),
                    description: t('games.pair-up-twin.howToPlay.step3.description'),
                    icon: "👯‍♀️"
                }
            ]}
            engine={engine}
            onExit={() => navigate(-1)}
            powerUps={powerUps}
            subHeaderRight={timerBar}
            cardBackground={<PairUpBackground />}
        >
            <div className={styles.gameContainer}>
                {showTapMatchHint && (
                    <div className={`${styles.tapMatchHint} ${isTapMatchHintExiting ? styles.exiting : ''}`}>
                        {t('games.pair-up-twin.ui.tapMatchHint')}
                    </div>
                )}
                <PairUpGrid
                    cards={logic.cards}
                    config={logic.gridConfig}
                    onCardClick={logic.handleCardClick}
                />
            </div>
        </Layout2>
    );
};

export default PairUpTwin;
