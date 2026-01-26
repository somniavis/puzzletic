import { useNavigate } from 'react-router-dom';
import { useMemo, useCallback, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Layout2 } from '../../../layouts/Standard/Layout2/index';
import { useGameEngine } from '../../../layouts/Standard/Layout0/useGameEngine';
import styles from './ColorLink.module.css';
import { useColorLinkLogic } from './GameLogic';
import type { PowerUpBtnProps } from '../../../../components/Game/PowerUpBtn';
import manifest_en from './locales/en';
const GAME_ID = 'color-link';

interface ColorLinkProps {
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

export default function ColorLink({ onExit }: ColorLinkProps) {
    const navigate = useNavigate();
    const { t, i18n } = useTranslation();
    const handleExit = onExit || (() => navigate(-1));

    useEffect(() => {
        const newResources = { en: { translation: { games: { 'color-link': manifest_en } } } };
        Object.keys(newResources).forEach(lang => {
            i18n.addResourceBundle(lang, 'translation', newResources[lang as keyof typeof newResources].translation, true, true);
        });
    }, [i18n]);

    const engine = useGameEngine({
        initialTime: 90,
    });

    const logic = useColorLinkLogic(engine);

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
            title={t('games.color-link.title')}
            subtitle={t('games.color-link.subtitle')}
            gameId={GAME_ID}
            engine={engine}
            powerUps={powerUps}
            onExit={handleExit}
            cardBackground={<WaveBackground />}
            instructions={[
                { icon: '🔴🔵', title: t('games.color-link.howToPlay.step1.title'), description: t('games.color-link.howToPlay.step1.description') },
                { icon: '✏️', title: t('games.color-link.howToPlay.step2.title'), description: t('games.color-link.howToPlay.step2.description') },
                { icon: '✅', title: t('games.color-link.howToPlay.step3.title'), description: t('games.color-link.howToPlay.step3.description') }
            ]}
        >
            <div
                className={styles.gameContainer}
                onPointerUp={logic.handleEnd} // Global release
                onPointerLeave={logic.handleEnd} // Leave game area = release
            >
                <div
                    className={styles.grid}
                    style={{ gridTemplateColumns: `repeat(${logic.currentLevel.size}, 1fr)` }}
                    onPointerMove={handlePointerMove}
                >
                    {logic.grid.flat().map((cell) => {
                        const colorClass = cell.path ? styles[cell.path] : '';
                        const dotClass = cell.dot ? styles[cell.dot] : '';

                        return (
                            <div
                                key={`${cell.row}-${cell.col}`}
                                className={`${styles.cell} ${colorClass}`}
                                data-cell="true"
                                data-row={cell.row}
                                data-col={cell.col}
                                onPointerDown={(e) => {
                                    e.currentTarget.releasePointerCapture(e.pointerId);
                                    logic.handleStart(cell.row, cell.col);
                                }}
                            >
                                {/* Center Hub (if path exists) */}
                                {cell.path && <div className={`${styles.pipeSegment} ${styles.pipeCenter}`} />}

                                {/* Pipe Segments */}
                                {cell.n && <div className={`${styles.pipeSegment} ${styles.pipeN}`} />}
                                {cell.s && <div className={`${styles.pipeSegment} ${styles.pipeS}`} />}
                                {cell.e && <div className={`${styles.pipeSegment} ${styles.pipeE}`} />}
                                {cell.w && <div className={`${styles.pipeSegment} ${styles.pipeW}`} />}

                                {/* Dot */}
                                {cell.dot && <div className={`${styles.dot} ${dotClass}`} />}
                            </div>
                        );
                    })}
                </div>
            </div>
        </Layout2>
    );
}

export const manifest = {
    id: GAME_ID,
    title: 'Color Link',
    titleKey: 'games.color-link.title',
    subtitle: 'Connect dots!',
    subtitleKey: 'games.color-link.subtitle',
    category: 'brain',
    level: 1,
    component: ColorLink,
    description: 'Connect matching colors without crossing lines.',
    descriptionKey: 'games.color-link.description',
    thumbnail: '🔗'
} as const;
