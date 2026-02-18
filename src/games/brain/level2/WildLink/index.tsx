import { useNavigate } from 'react-router-dom';
import { useMemo, useCallback, useEffect, useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Layout2 } from '../../../layouts/Standard/Layout2';
import { useGameEngine } from '../../../layouts/Standard/Layout0/useGameEngine';
import styles from './WildLink.module.css';
import { useColorLinkLogic } from './GameLogic';
import type { PowerUpBtnProps } from '../../../../components/Game/PowerUpBtn';
import manifest_en from './locales/en';

import { GameIds } from '../../../../constants/gameIds';
const GAME_ID = GameIds.WILD_LINK;

interface WildLinkProps {
    onExit?: () => void;
}

const WaveBackground = () => {
    return (
        <div className={styles.waveBgContainer}>
            <div className={styles.wave}></div>
            <div className={styles.wave}></div>
            <div className={styles.wave}></div>
        </div>
    );
};

export default function WildLink({ onExit }: WildLinkProps) {
    const navigate = useNavigate();
    const { t, i18n } = useTranslation();
    const handleExit = onExit || (() => navigate(-1));

    useEffect(() => {
        const newResources = { en: { translation: { games: { 'wild-link': manifest_en } } } };
        Object.keys(newResources).forEach(lang => {
            i18n.addResourceBundle(lang, 'translation', newResources[lang as keyof typeof newResources].translation, true, true);
        });
    }, [i18n]);

    const engine = useGameEngine({
        initialTime: 90,
    });

    const logic = useColorLinkLogic(engine);
    const [showLinkHint, setShowLinkHint] = useState(false);
    const [isLinkHintExiting, setIsLinkHintExiting] = useState(false);
    const hasShownLinkHintRef = useRef(false);
    const linkHintTimerRef = useRef<number | null>(null);
    const linkHintExitTimerRef = useRef<number | null>(null);

    useEffect(() => {
        const isFirstQuestion = engine.score === 0 && engine.stats.correct === 0 && engine.stats.wrong === 0;
        if (engine.gameState !== 'playing') {
            if (engine.gameState === 'gameover' || engine.gameState === 'idle') {
                setShowLinkHint(false);
                setIsLinkHintExiting(false);
                hasShownLinkHintRef.current = false;
            }
            return;
        }
        if (!isFirstQuestion || hasShownLinkHintRef.current) return;

        hasShownLinkHintRef.current = true;
        setShowLinkHint(true);
        setIsLinkHintExiting(false);

        linkHintTimerRef.current = window.setTimeout(() => {
            setIsLinkHintExiting(true);
            linkHintExitTimerRef.current = window.setTimeout(() => {
                setShowLinkHint(false);
                setIsLinkHintExiting(false);
                linkHintExitTimerRef.current = null;
            }, 220);
            linkHintTimerRef.current = null;
        }, 1800);
    }, [engine.gameState, engine.score, engine.stats.correct, engine.stats.wrong]);

    useEffect(() => {
        return () => {
            if (linkHintTimerRef.current != null) {
                window.clearTimeout(linkHintTimerRef.current);
                linkHintTimerRef.current = null;
            }
            if (linkHintExitTimerRef.current != null) {
                window.clearTimeout(linkHintExitTimerRef.current);
                linkHintExitTimerRef.current = null;
            }
        };
    }, []);

    // Standard PowerUps (memoized to prevent recreation on every render)
    const powerUps: PowerUpBtnProps[] = useMemo(() => [
        {
            count: logic.powerUps.timeFreeze,
            icon: '❄️',
            color: 'blue' as const,
            onClick: () => logic.activatePowerUp('timeFreeze'),
            status: logic.isTimeFrozen ? 'active' : 'normal',
            title: 'Time Freeze',
            disabledConfig: logic.isTimeFrozen || logic.powerUps.timeFreeze <= 0
        },
        {
            count: logic.powerUps.extraLife,
            icon: '❤️',
            color: 'red' as const,
            onClick: () => logic.activatePowerUp('extraLife'),
            status: engine.lives >= 3 ? 'maxed' : 'normal',
            title: 'Extra Life',
            disabledConfig: engine.lives >= 3 || logic.powerUps.extraLife <= 0
        },
        {
            count: logic.powerUps.doubleScore,
            icon: '⚡',
            color: 'yellow' as const,
            onClick: () => logic.activatePowerUp('doubleScore'),
            status: logic.isDoubleScore ? 'active' : 'normal',
            title: 'Double Score',
            disabledConfig: logic.isDoubleScore || logic.powerUps.doubleScore <= 0
        }
    ], [logic.powerUps, logic.isTimeFrozen, logic.isDoubleScore, logic.activatePowerUp, engine.lives]);

    const handlePointerMove = useCallback((e: React.PointerEvent) => {
        // Get element under the pointer (works for both mouse and touch)
        const element = document.elementFromPoint(e.clientX, e.clientY);
        if (!element) return;

        // Find the cell element (might be clicking on a child like pipe or dot)
        const cellElement = element.closest('[data-cell]');
        if (!cellElement) return;

        // Extract row and col from data attributes
        const row = parseInt(cellElement.getAttribute('data-row') || '-1');
        const col = parseInt(cellElement.getAttribute('data-col') || '-1');

        if (row >= 0 && col >= 0) {
            logic.handleMove(row, col);
        }
    }, [logic.handleMove]);

    return (
        <Layout2
            title={t('games.wild-link.title')}
            subtitle={t('games.wild-link.subtitle')}
            gameId={GAME_ID}
            engine={engine}
            powerUps={powerUps}
            onExit={handleExit}
            cardBackground={<WaveBackground />}
            instructions={[
                { icon: '🦜🦅', title: t('games.wild-link.howToPlay.step1.title'), description: t('games.wild-link.howToPlay.step1.description') },
                { icon: '✏️', title: t('games.wild-link.howToPlay.step2.title'), description: t('games.wild-link.howToPlay.step2.description') },
                { icon: '✅', title: t('games.wild-link.howToPlay.step3.title'), description: t('games.wild-link.howToPlay.step3.description') }
            ]}
        >
            <div className={styles.gameContainer}>
                {showLinkHint && (
                    <div className={`${styles.wildLinkHint} ${isLinkHintExiting ? styles.exiting : ''}`}>
                        {t('games.wild-link.ui.linkHint')}
                    </div>
                )}
                <div
                    className={styles.grid}
                    style={{ gridTemplateColumns: `repeat(${logic.currentLevel.size}, 1fr)` }}
                    onPointerMove={handlePointerMove}
                    onPointerLeave={() => logic.handleEnd()}
                    onPointerUp={() => logic.handleEnd()}
                >
                    {logic.grid.flat().map((cell) => (
                        <div
                            key={`${cell.row}-${cell.col}`}
                            className={`${styles.cell} ${styles[cell.path || 'empty'] || ''}`}
                            data-cell="true"
                            data-row={cell.row}
                            data-col={cell.col}
                            onPointerDown={() => logic.handleStart(cell.row, cell.col)}
                        >
                            {/* Render Pipes (Directional Arms) */}
                            {cell.path && (
                                <>
                                    <div className={`${styles.pipeSegment} ${styles.pipeCenter}`} />
                                    {cell.n && <div className={`${styles.pipeSegment} ${styles.pipeN}`} />}
                                    {cell.s && <div className={`${styles.pipeSegment} ${styles.pipeS}`} />}
                                    {cell.w && <div className={`${styles.pipeSegment} ${styles.pipeW}`} />}
                                    {cell.e && <div className={`${styles.pipeSegment} ${styles.pipeE}`} />}
                                </>
                            )}

                            {/* Render Dot */}
                            {cell.dot && (
                                <div className={`${styles.dot} ${styles[cell.category!]}`}>
                                    {cell.dot}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </Layout2>
    );

}

export const manifest = {
    id: GameIds.WILD_LINK,
    title: 'Wild Link',
    titleKey: 'games.wild-link.title',
    subtitle: 'Connect matching species!',
    subtitleKey: 'games.wild-link.subtitle',
    category: 'brain',
    level: 2,
    component: WildLink,
    description: 'Connect matching species without crossing paths.',
    descriptionKey: 'games.wild-link.description',
    thumbnail: '🦁'
} as const;
