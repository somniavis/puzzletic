import React, { useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Layout1 } from '../../../layouts/Standard/Layout1';
import { useGameEngine } from '../../../layouts/Standard/Layout0/useGameEngine';
import { useOmokGame } from './GameLogic';
import styles from './Omok.module.css';
import { BlobBackground } from '../../../math/components/BlobBackground';

interface OmokGameProps {
    onExit: () => void;
    gameId?: string;
}

export const OmokGame: React.FC<OmokGameProps> = ({ onExit, gameId }) => {
    const { t } = useTranslation();

    const engine = useGameEngine({
        initialLives: 3,
        initialTime: 180, // 3 mins for a quick game
        maxDifficulty: 1
    });

    const instructions = useMemo(() => [
        {
            icon: '⚫⚪',
            title: t('games.omok.howToPlay.step1.title'),
            description: t('games.omok.howToPlay.step1.description')
        },
        {
            icon: '🛡️',
            title: t('games.omok.howToPlay.step2.title'),
            description: t('games.omok.howToPlay.step2.description')
        },
        {
            icon: '🏆',
            title: t('games.omok.howToPlay.step3.title'),
            description: t('games.omok.howToPlay.step3.description')
        }
    ], [t]);

    return (
        <Layout1
            gameId={gameId}
            title={t('games.omok.title')}
            subtitle={t('games.omok.subtitle')}
            description={t('games.omok.description')}
            instructions={instructions}
            onExit={onExit}
            engine={engine}
            cardBackground={<BlobBackground colors={{ blob1: '#e0f2fe', blob2: '#f0f9ff', blob3: '#bae6fd', blob4: '#7dd3fc' }} />}
        >
            <OmokBoardWrapper engine={engine} />
        </Layout1>
    );
};

// Inner component to access engine
const OmokBoardWrapper = ({ engine }: { engine: any }) => {
    const { t } = useTranslation();
    const { updateScore, updateLives, registerEvent } = engine;
    const {
        board,
        playerSide,

        isAiThinking,
        lastMove,
        handleCellClick,
        resetBoard,
        winner
    } = useOmokGame({ onGameOver: () => { } }); // No-op for internal callback, we use useEffect now
    const [showGuideHint, setShowGuideHint] = useState(false);
    const [isGuideHintExiting, setIsGuideHintExiting] = useState(false);
    const hasShownGuideHintRef = useRef(false);

    // Handle Game Over Side Effects
    React.useEffect(() => {
        if (!winner) return;

        if (winner === 'draw') {
            updateScore(30);
            // registerEvent({ type: 'draw' }); // Optional
        } else if (winner === playerSide) {
            updateScore(500);
            registerEvent({ type: 'correct' });
        } else {
            updateScore(1); // Consolation point to count as "attempt"
            updateLives(false);
            registerEvent({ type: 'wrong' });
        }

        // Manual reset delay
        const timer = setTimeout(() => {
            resetBoard();
        }, 700);

        return () => clearTimeout(timer);
    }, [winner, playerSide, updateScore, updateLives, registerEvent, resetBoard]);

    React.useEffect(() => {
        const isFirstProblem = engine.stats.correct === 0 && engine.stats.wrong === 0;

        if (engine.gameState !== 'playing') {
            if (engine.gameState === 'idle' || engine.gameState === 'gameover') {
                setShowGuideHint(false);
                setIsGuideHintExiting(false);
                hasShownGuideHintRef.current = false;
            }
            return;
        }

        if (!isFirstProblem || hasShownGuideHintRef.current) return;

        hasShownGuideHintRef.current = true;
        setShowGuideHint(true);
        setIsGuideHintExiting(false);
    }, [engine.gameState, engine.stats.correct, engine.stats.wrong]);

    React.useEffect(() => {
        if (!showGuideHint) return;

        setIsGuideHintExiting(false);
        const hideTimer = window.setTimeout(() => {
            setIsGuideHintExiting(true);
        }, 1800);
        const removeTimer = window.setTimeout(() => {
            setShowGuideHint(false);
            setIsGuideHintExiting(false);
        }, 2020);

        return () => {
            window.clearTimeout(hideTimer);
            window.clearTimeout(removeTimer);
        };
    }, [showGuideHint]);

    // Hoshi points for 15x15 (3, 7, 11) -> indices (3, 7, 11)
    // Pre-calculated for performance
    const isHoshi = (r: number, c: number) => {
        return (r === 3 || r === 7 || r === 11) && (c === 3 || c === 7 || c === 11);
    };

    return (
        <div className={styles.boardContainer}>
            {showGuideHint && (
                <div className={`${styles.omokGuideHint} ${isGuideHintExiting ? styles.omokGuideHintExiting : ''}`}>
                    {t('games.omok.ui.guideHint')}
                </div>
            )}
            {/* Status Message */}
            <div className={styles.statusMessage}>
                {isAiThinking ? (
                    <>
                        {t('games.omok.status.aiTurn')}
                        <span className={styles.statusIcon}>
                            <div className={`${styles.statusStone} ${playerSide === 'black' ? styles.white : styles.black}`} />
                        </span>
                    </>
                ) : (
                    <>
                        {t('games.omok.status.playerTurn')}
                        <span className={styles.statusIcon}>
                            <div className={`${styles.statusStone} ${playerSide === 'black' ? styles.black : styles.white}`} />
                        </span>
                    </>
                )}
            </div>

            <div className={styles.omokBoard}>
                {board.map((row, r) => (
                    row.map((cell, c) => (
                        <div
                            key={`${r}-${c}`}
                            className={styles.cell}
                            onClick={() => handleCellClick(r, c)}
                        >
                            {/* Render Hoshi if needed */}
                            {isHoshi(r, c) && (
                                <div className={styles.hoshi} />
                            )}

                            {/* Render Stone */}
                            {cell === 'black' && <div className={`${styles.stone} ${styles.black}`} />}
                            {cell === 'white' && <div className={`${styles.stone} ${styles.white}`} />}

                            {/* Last Move Marker */}
                            {lastMove?.r === r && lastMove?.c === c && (
                                <div className={styles.lastMoveMarker} />
                            )}
                        </div>
                    ))
                ))}
            </div>
        </div>
    );
};
