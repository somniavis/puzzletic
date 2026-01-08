import { useNavigate } from 'react-router-dom';
import { Layout2 } from '../../../layouts/Standard/Layout2/index';
import { useGameEngine } from '../../../layouts/Standard/Layout0/useGameEngine';
import styles from './ColorLink.module.css';
import { useColorLinkLogic } from './GameLogic';
import type { PowerUpBtnProps } from '../../../../components/Game/PowerUpBtn';
const GAME_ID = 'brain-level1-color-link';

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
    const handleExit = onExit || (() => navigate(-1));

    const engine = useGameEngine({
        initialTime: 90,
    });

    const logic = useColorLinkLogic(engine);

    // Standard PowerUps
    const powerUps: PowerUpBtnProps[] = [
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
    ];

    const handlePointerEnter = (r: number, c: number, e: React.PointerEvent) => {
        // Only trigger move if primary button is held down (mouse) or active touch
        if (e.buttons === 1) {
            logic.handleMove(r, c);
        }
    };

    return (
        <Layout2
            title="Color Link"
            subtitle="Connect the Colors"
            gameId={GAME_ID}
            engine={engine}
            powerUps={powerUps}
            onExit={handleExit}
            cardBackground={<WaveBackground />}
            instructions={[
                { icon: '🔴', title: 'Connect', description: 'Link matching colors.' },
                { icon: '⚡', title: 'No Cross', description: 'Paths cannot cross.' },
                { icon: '✨', title: 'Fill All', description: 'Use all squares.' }
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
                >
                    {logic.grid.flat().map((cell) => {
                        const colorClass = cell.path ? styles[cell.path] : '';
                        const dotClass = cell.dot ? styles[cell.dot] : '';

                        return (
                            <div
                                key={`${cell.row}-${cell.col}`}
                                className={`${styles.cell} ${colorClass}`}
                                onPointerDown={(e) => {
                                    e.currentTarget.releasePointerCapture(e.pointerId); // Allow event to bubble/enter other cells
                                    logic.handleStart(cell.row, cell.col);
                                }}
                                onPointerEnter={(e) => handlePointerEnter(cell.row, cell.col, e)}
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
    subtitle: 'Connect dots!',
    category: 'brain',
    level: 1,
    component: ColorLink,
    description: 'Connect matching colors without crossing lines.',
    thumbnail: '🔗'
} as const;
