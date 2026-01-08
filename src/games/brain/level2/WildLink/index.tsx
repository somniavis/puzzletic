import { useNavigate } from 'react-router-dom';
import { useMemo, useCallback } from 'react';
import { Layout2 } from '../../../layouts/Standard/Layout2';
import { useGameEngine } from '../../../layouts/Standard/Layout0/useGameEngine';
import styles from './WildLink.module.css';
import { useColorLinkLogic } from './GameLogic';
import type { PowerUpBtnProps } from '../../../../components/Game/PowerUpBtn';

const GAME_ID = 'brain-level2-wild-link';

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
    const handleExit = onExit || (() => navigate(-1));

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

    const handlePointerEnter = useCallback((r: number, c: number, e: React.PointerEvent) => {
        // Only trigger move if primary button is held down (mouse) or active touch
        if (e.buttons === 1) {
            logic.handleMove(r, c);
        }
    }, [logic.handleMove]);

    return (
        <Layout2
            title="Wild Link"
            subtitle="Connect matching species!"
            gameId={GAME_ID}
            engine={engine}
            powerUps={powerUps}
            onExit={handleExit}
            cardBackground={<WaveBackground />}
            instructions={[
                { icon: '🦁', title: 'Connect', description: 'Link matching species.' },
                { icon: '⚡', title: 'No Cross', description: 'Paths cannot cross.' },
                { icon: '🧩', title: 'Fill Grid', description: 'Use all cells!' }
            ]}
        >
            <div className={styles.gameContainer}>
                <div
                    className={styles.grid}
                    style={{ gridTemplateColumns: `repeat(${logic.currentLevel.size}, 1fr)` }}
                    onPointerLeave={() => logic.handleEnd()}
                    onPointerUp={() => logic.handleEnd()}
                >
                    {logic.grid.flat().map((cell) => (
                        <div
                            key={`${cell.row}-${cell.col}`}
                            className={`${styles.cell} ${styles[cell.path || 'empty'] || ''}`}
                            onPointerDown={() => logic.handleStart(cell.row, cell.col)}
                            onPointerEnter={(e) => handlePointerEnter(cell.row, cell.col, e)}
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
    id: 'brain-level2-wild-link',
    title: 'Wild Link',
    subtitle: 'Connect matching species!',
    category: 'brain',
    level: 2,
    component: WildLink,
    description: 'Connect matching species without crossing paths.',
    thumbnail: '🦁'
} as const;
