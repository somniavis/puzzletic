import React from 'react';
import { JelloAvatar } from '../../../../components/characters/JelloAvatar';
import type { Character } from '../../../../types/character';
import {
    PlayArcadeGameOverOverlay,
    PlayArcadeStartOverlay,
} from '../../shared/PlayArcadeUI';
import {
    FIELD_FENCE_POSTS,
    FIELD_GROUND_PATCHES,
} from './constants';
import { formatRunClock } from './helpers';
import type {
    BombBlast,
    BombStrike,
    ChaserEnemy,
    EliteEnemy,
    EnemyProjectile,
    FencePost,
    GroundPatch,
    JelloKnightAnnouncement,
    JelloKnightPhaseOverlay,
    Obstacle,
    RangedEnemy,
    SpawnSignal,
    UpgradeOption,
    UpgradeOptionId,
    Vector2,
    XpPickup,
} from './types';

type TranslateFn = (key: string, values?: Record<string, string | number>) => string;

const toPositionStyle = (x: number, y: number): React.CSSProperties => ({
    left: `${Math.round(x)}px`,
    top: `${Math.round(y)}px`,
});

const toSizeStyle = (width: number, height: number): React.CSSProperties => ({
    width: `${width}px`,
    height: `${height}px`,
});

const clampPercent = (value: number) => Math.max(0, Math.min(100, value));

const FencePostNode = React.memo<{ post: FencePost }>(({ post }) => (
    <div
        className={`jello-knight__fence-post jello-knight__fence-post--${post.side} jello-knight__fence-post--${post.tone}`}
        style={{
            ...toPositionStyle(post.x, post.y),
            ...toSizeStyle(post.width, post.height),
            transform: `rotate(${post.tilt}deg)`,
            ['--jello-knight-fence-band-offset' as string]: `${post.bandOffset}px`,
        }}
    />
));

const GroundPatchNode = React.memo<{ patch: GroundPatch }>(({ patch }) => (
    <div
        className="jello-knight__ground-patch-wrap"
        style={{
            ...toPositionStyle(patch.x, patch.y),
            ...toSizeStyle(patch.width, patch.height),
            transform: patch.rotate ? `rotate(${patch.rotate}deg)` : undefined,
        }}
    >
        <div className="jello-knight__ground-patch-outline" />
        <div
            className={`jello-knight__ground-patch jello-knight__ground-patch--${patch.markPattern ?? 'a'}`}
            style={{
                ['--jello-ground-mark-scale' as string]: `${patch.markScale ?? 1}`,
            }}
        />
    </div>
));

const ObstacleNode = React.memo<{ obstacle: Obstacle }>(({ obstacle }) => (
    <div
        className="jello-knight__obstacle"
        style={{
            ...toPositionStyle(obstacle.x, obstacle.y),
            ...toSizeStyle(obstacle.width, obstacle.height),
        }}
    />
));

const EnemyUnit = React.memo<{ enemy: ChaserEnemy }>(({ enemy }) => (
    <div
        className={`jello-knight__enemy jello-knight__enemy--${enemy.enemyType}`}
        style={{
            ...toPositionStyle(enemy.x, enemy.y),
            ['--jello-knight-enemy-scale' as string]: `${enemy.sizeScale}`,
        }}
    >
        <span className="jello-knight__enemy-healthbar" aria-hidden="true">
            <span
                className="jello-knight__enemy-healthbar-fill"
                style={{ width: `${clampPercent((enemy.hp / enemy.maxHp) * 100)}%` }}
            />
        </span>
        <span className="jello-knight__enemy-emoji-stack" aria-hidden="true">
            <span className="jello-knight__enemy-emoji jello-knight__enemy-emoji--shadow">{enemy.emoji}</span>
            <span className="jello-knight__enemy-emoji">{enemy.emoji}</span>
        </span>
    </div>
));

const RangedEnemyUnit = React.memo<{ enemy: RangedEnemy }>(({ enemy }) => (
    <div
        className={`jello-knight__ranged-enemy jello-knight__ranged-enemy--${enemy.enemyType}`}
        style={toPositionStyle(enemy.x, enemy.y)}
    >
        <span className="jello-knight__enemy-healthbar jello-knight__enemy-healthbar--ranged" aria-hidden="true">
            <span
                className="jello-knight__enemy-healthbar-fill jello-knight__enemy-healthbar-fill--ranged"
                style={{ width: `${clampPercent((enemy.hp / enemy.maxHp) * 100)}%` }}
            />
        </span>
        <span className="jello-knight__enemy-emoji-stack" aria-hidden="true">
            <span className="jello-knight__ranged-enemy-emoji jello-knight__ranged-enemy-emoji--shadow">{enemy.emoji}</span>
            <span className="jello-knight__ranged-enemy-emoji">{enemy.emoji}</span>
        </span>
    </div>
));

const EliteUnit = React.memo<{ eliteEnemy: EliteEnemy }>(({ eliteEnemy }) => {
    const renderFacing = eliteEnemy.emojiBaseFacing === eliteEnemy.facing ? 'default' : 'flipped';

    return (
        <div
            className={`jello-knight__elite jello-knight__elite--${eliteEnemy.enemyType}`}
            style={toPositionStyle(eliteEnemy.x, eliteEnemy.y)}
        >
            <span className="jello-knight__enemy-healthbar jello-knight__enemy-healthbar--elite" aria-hidden="true">
                <span
                    className="jello-knight__enemy-healthbar-fill jello-knight__enemy-healthbar-fill--elite"
                    style={{ width: `${clampPercent((eliteEnemy.hp / eliteEnemy.maxHp) * 100)}%` }}
                />
            </span>
            <span className="jello-knight__elite-crown" aria-hidden="true">👑</span>
            <span
                className={`jello-knight__enemy-emoji-stack jello-knight__elite-stack jello-knight__elite-stack--${renderFacing}`}
                aria-hidden="true"
            >
                <span className="jello-knight__elite-emoji jello-knight__elite-emoji--shadow">{eliteEnemy.emoji}</span>
                <span className="jello-knight__elite-emoji">{eliteEnemy.emoji}</span>
            </span>
        </div>
    );
});

const ProjectileNode = React.memo<{ projectile: EnemyProjectile }>(({ projectile }) => (
    <div
        className="jello-knight__enemy-projectile"
        style={toPositionStyle(projectile.x, projectile.y)}
    />
));

const OrbitNode = React.memo<{
    orbPosition: Vector2;
    orbitPalette: { core: string; glow: string; edge: string };
}>(({ orbPosition, orbitPalette }) => (
    <div
        className="jello-knight__orbit-instance"
        style={{
            ...toPositionStyle(orbPosition.x, orbPosition.y),
            ['--jello-knight-orb-core' as string]: orbitPalette.core,
            ['--jello-knight-orb-glow' as string]: orbitPalette.glow,
            ['--jello-knight-orb-edge' as string]: orbitPalette.edge,
        }}
    >
        <span className="jello-knight__orb" />
    </div>
));

const BombStrikeNode = React.memo<{
    bombRadius: number;
    bombStrike: BombStrike;
    elapsedMs: number;
}>(({ bombRadius, bombStrike, elapsedMs }) => {
    const bombVisualSize = 42;
    const isLanded = elapsedMs >= bombStrike.landAtMs;
    const flightDuration = Math.max(1, bombStrike.landAtMs - bombStrike.createdAtMs);
    const flightProgress = Math.max(
        0,
        Math.min(1, (elapsedMs - bombStrike.createdAtMs) / flightDuration)
    );
    const travelDistance = Math.hypot(
        bombStrike.targetX - bombStrike.sourceX,
        bombStrike.targetY - bombStrike.sourceY
    );
    const arcHeight = Math.max(72, travelDistance * 0.28);
    const flightX = bombStrike.sourceX + ((bombStrike.targetX - bombStrike.sourceX) * flightProgress);
    const flightY = bombStrike.sourceY
        + ((bombStrike.targetY - bombStrike.sourceY) * flightProgress)
        - (arcHeight * 4 * flightProgress * (1 - flightProgress));
    const countdown = Math.max(1, Math.ceil((bombStrike.triggerAtMs - elapsedMs) / 1000));
    const minX = Math.min(bombStrike.sourceX, bombStrike.targetX);
    const minY = Math.min(bombStrike.sourceY, bombStrike.targetY) - arcHeight;
    const pathWidth = Math.max(1, Math.abs(bombStrike.targetX - bombStrike.sourceX));
    const pathHeight = Math.max(1, Math.abs(bombStrike.targetY - bombStrike.sourceY) + arcHeight);
    const startX = bombStrike.sourceX - minX;
    const startY = bombStrike.sourceY - minY;
    const endX = bombStrike.targetX - minX;
    const endY = bombStrike.targetY - minY;
    const controlX = (startX + endX) / 2;
    const controlY = Math.max(0, Math.min(startY, endY) - arcHeight);

    return (
        <>
            {!isLanded && (
                <div
                    className="jello-knight__bomb-flight"
                    style={{
                        ...toPositionStyle(minX, minY),
                        ...toSizeStyle(pathWidth, pathHeight),
                    }}
                    aria-hidden="true"
                >
                    <svg
                        className="jello-knight__bomb-flight-path"
                        viewBox={`0 0 ${pathWidth} ${pathHeight}`}
                        preserveAspectRatio="none"
                    >
                        <path
                            d={`M ${startX} ${startY} Q ${controlX} ${controlY} ${endX} ${endY}`}
                            vectorEffect="non-scaling-stroke"
                        />
                    </svg>
                </div>
            )}
            <div
                className={`jello-knight__bomb-strike${isLanded
                    ? ' jello-knight__bomb-strike--landed'
                    : ' jello-knight__bomb-strike--flying'}`}
                style={{
                    ...toPositionStyle(isLanded ? bombStrike.targetX : flightX, isLanded ? bombStrike.targetY : flightY),
                    ...toSizeStyle(bombVisualSize, bombVisualSize),
                    marginLeft: `${-(bombVisualSize / 2)}px`,
                    marginTop: `${-(bombVisualSize / 2)}px`,
                }}
            >
                {isLanded && (
                    <span
                        className="jello-knight__bomb-radius-ring"
                        style={{
                            ...toSizeStyle(bombRadius * 2, bombRadius * 2),
                            marginLeft: `${-bombRadius}px`,
                            marginTop: `${-bombRadius}px`,
                        }}
                        aria-hidden="true"
                    />
                )}
                <span className="jello-knight__bomb-emoji-stack" aria-hidden="true">
                    <span className="jello-knight__bomb-core jello-knight__bomb-core--shadow">💣</span>
                    <span className="jello-knight__bomb-core">💣</span>
                </span>
                {isLanded && <span className="jello-knight__bomb-countdown">{countdown}</span>}
            </div>
        </>
    );
});

const BombBlastNode = React.memo<{ blast: BombBlast }>(({ blast }) => (
    <div
        className="jello-knight__bomb-blast"
        style={{
            ...toPositionStyle(blast.x, blast.y),
            ...toSizeStyle(blast.radius * 2, blast.radius * 2),
            marginLeft: `${-blast.radius}px`,
            marginTop: `${-blast.radius}px`,
        }}
        aria-hidden="true"
    />
));

const SpawnSignalNode = React.memo<{ signal: SpawnSignal }>(({ signal }) => (
    <div
        className={`jello-knight__spawn-signal jello-knight__spawn-signal--${signal.tone}`}
        style={{
            ...toPositionStyle(signal.x, signal.y),
            ...toSizeStyle(signal.size, signal.size),
            marginLeft: `${-(signal.size / 2)}px`,
            marginTop: `${-(signal.size / 2)}px`,
        }}
    />
));

const PickupNode = React.memo<{ pickup: XpPickup }>(({ pickup }) => (
    <div
        className={`jello-knight__xp-pickup ${pickup.pickupKind === 'xp'
            ? 'jello-knight__xp-pickup--xp'
            : pickup.pickupKind === 'heart'
                ? 'jello-knight__xp-pickup--heart'
                : `jello-knight__xp-pickup--${pickup.gemTier}`}`}
        style={toPositionStyle(pickup.x, pickup.y)}
    >
        {pickup.pickupKind === 'xp' ? (
            <span className="jello-knight__pickup-orb jello-knight__pickup-orb--xp" aria-hidden="true">
                <span className="jello-knight__pickup-orb-emoji jello-knight__pickup-orb-emoji--xp">💧</span>
            </span>
        ) : pickup.pickupKind === 'heart' ? (
            <span className="jello-knight__pickup-orb jello-knight__pickup-orb--heart" aria-hidden="true">
                <span className="jello-knight__pickup-orb-emoji">❤️</span>
            </span>
        ) : (
            <span className={`jello-knight__pickup-orb jello-knight__pickup-orb--${pickup.gemTier}`} aria-hidden="true">
                <span className="jello-knight__pickup-orb-emoji jello-knight__pickup-orb-emoji--animal">{pickup.animalEmoji}</span>
            </span>
        )}
    </div>
));

type FieldProps = {
    activeObstacles: Obstacle[];
    announcement: JelloKnightAnnouncement | null;
    bombBlasts: BombBlast[];
    bombRadius: number;
    bombStrikes: BombStrike[];
    controlsRef: React.RefObject<HTMLDivElement | null>;
    damageFlashOpacity: number;
    elapsedMs: number;
    gt: TranslateFn;
    joystickBaseRef: React.RefObject<HTMLDivElement | null>;
    eliteEnemy: EliteEnemy | null;
    enemies: ChaserEnemy[];
    fieldStyle: React.CSSProperties;
    gamePhase: JelloKnightPhaseOverlay;
    handleJoystickPointerCancel: (event: React.PointerEvent<HTMLDivElement>) => void;
    handleJoystickPointerDown: (event: React.PointerEvent<HTMLDivElement>) => void;
    handleJoystickPointerMove: (event: React.PointerEvent<HTMLDivElement>) => void;
    handleJoystickPointerUp: (event: React.PointerEvent<HTMLDivElement>) => void;
    joystickKnobStyle: React.CSSProperties;
    orbitPositions: Vector2[];
    orbitPalette: { core: string; glow: string; edge: string };
    playerStyle: React.CSSProperties;
    runnerMotionStyle: React.CSSProperties;
    projectiles: EnemyProjectile[];
    rangedEnemies: RangedEnemy[];
    runnerCharacter: Character;
    safeSpeciesId: string;
    spawnSignals: SpawnSignal[];
    stageMoodStyle: React.CSSProperties;
    stageRef: React.RefObject<HTMLDivElement | null>;
    xpPickups: XpPickup[];
};

const StaticArenaDecor = React.memo(() => (
    <>
        <div className="jello-knight__field-backdrop" />
        <div className="jello-knight__field-grid" />
        <div className="jello-knight__field-fence" aria-hidden="true">
            <div className="jello-knight__field-fence-rope jello-knight__field-fence-rope--top" />
            <div className="jello-knight__field-fence-rope jello-knight__field-fence-rope--bottom" />
            <div className="jello-knight__field-fence-rope jello-knight__field-fence-rope--left" />
            <div className="jello-knight__field-fence-rope jello-knight__field-fence-rope--right" />
            {FIELD_FENCE_POSTS.map((post) => <FencePostNode key={post.id} post={post} />)}
        </div>
        <div className="jello-knight__field-ground" aria-hidden="true">
            {FIELD_GROUND_PATCHES.map((patch) => <GroundPatchNode key={patch.id} patch={patch} />)}
        </div>
    </>
));

type ObstaclesLayerProps = {
    activeObstacles: Obstacle[];
};

const ObstaclesLayer = React.memo<ObstaclesLayerProps>(({ activeObstacles }) => (
    <>
        {activeObstacles.map((obstacle) => <ObstacleNode key={obstacle.id} obstacle={obstacle} />)}
    </>
));

type CombatLayerProps = {
    bombBlasts: BombBlast[];
    bombRadius: number;
    bombStrikes: BombStrike[];
    elapsedMs: number;
    eliteEnemy: EliteEnemy | null;
    enemies: ChaserEnemy[];
    orbitPalette: { core: string; glow: string; edge: string };
    orbitPositions: Vector2[];
    projectiles: EnemyProjectile[];
    rangedEnemies: RangedEnemy[];
    spawnSignals: SpawnSignal[];
    xpPickups: XpPickup[];
};

const CombatLayer = React.memo<CombatLayerProps>(({
    bombBlasts,
    bombRadius,
    bombStrikes,
    elapsedMs,
    eliteEnemy,
    enemies,
    orbitPalette,
    orbitPositions,
    projectiles,
    rangedEnemies,
    spawnSignals,
    xpPickups,
}) => (
    <>
        {enemies.map((enemy) => <EnemyUnit key={enemy.id} enemy={enemy} />)}
        {rangedEnemies.map((enemy) => <RangedEnemyUnit key={enemy.id} enemy={enemy} />)}
        {eliteEnemy && <EliteUnit eliteEnemy={eliteEnemy} />}
        {projectiles.map((projectile) => <ProjectileNode key={projectile.id} projectile={projectile} />)}
        {orbitPositions.map((orbPosition, index) => (
            <OrbitNode key={`orbit-${index}`} orbPosition={orbPosition} orbitPalette={orbitPalette} />
        ))}
        {bombStrikes.map((bombStrike) => (
            <BombStrikeNode
                key={bombStrike.id}
                bombRadius={bombRadius}
                bombStrike={bombStrike}
                elapsedMs={elapsedMs}
            />
        ))}
        {bombBlasts.map((blast) => <BombBlastNode key={`blast-${blast.id}`} blast={blast} />)}
        {spawnSignals.map((signal) => <SpawnSignalNode key={signal.id} signal={signal} />)}
        {xpPickups.map((pickup) => <PickupNode key={pickup.id} pickup={pickup} />)}
    </>
));

type RunnerLayerProps = {
    playerStyle: React.CSSProperties;
    runnerCharacter: Character;
    runnerMotionStyle: React.CSSProperties;
    safeSpeciesId: string;
};

const RunnerLayer = React.memo<RunnerLayerProps>(({
    playerStyle,
    runnerCharacter,
    runnerMotionStyle,
    safeSpeciesId,
}) => (
    <div className="jello-knight__runner-core" style={playerStyle}>
        <div className="jello-knight__runner-avatar" style={runnerMotionStyle}>
            <div className="jello-knight__runner-jello">
                <JelloAvatar
                    character={runnerCharacter}
                    speciesId={safeSpeciesId}
                    size="small"
                    disableAnimation
                />
            </div>
        </div>
    </div>
));

export const JelloKnightField: React.FC<FieldProps> = ({
    activeObstacles,
    announcement,
    bombBlasts,
    bombRadius,
    bombStrikes,
    controlsRef,
    damageFlashOpacity,
    elapsedMs,
    gt,
    joystickBaseRef,
    eliteEnemy,
    enemies,
    fieldStyle,
    gamePhase,
    handleJoystickPointerCancel,
    handleJoystickPointerDown,
    handleJoystickPointerMove,
    handleJoystickPointerUp,
    joystickKnobStyle,
    orbitPositions,
    orbitPalette,
    playerStyle,
    runnerMotionStyle,
    projectiles,
    rangedEnemies,
    runnerCharacter,
    safeSpeciesId,
    spawnSignals,
    stageMoodStyle,
    stageRef,
    xpPickups,
}) => (
    <div className="jello-knight__stage-shell">
        <div className="jello-knight__stage" ref={stageRef} style={stageMoodStyle}>
            <div className="jello-knight__viewport">
                <div className="jello-knight__field" style={fieldStyle}>
                    <StaticArenaDecor />
                    <ObstaclesLayer activeObstacles={activeObstacles} />
                    <CombatLayer
                        bombBlasts={bombBlasts}
                        bombRadius={bombRadius}
                        bombStrikes={bombStrikes}
                        elapsedMs={elapsedMs}
                        eliteEnemy={eliteEnemy}
                        enemies={enemies}
                        orbitPalette={orbitPalette}
                        orbitPositions={orbitPositions}
                        projectiles={projectiles}
                        rangedEnemies={rangedEnemies}
                        spawnSignals={spawnSignals}
                        xpPickups={xpPickups}
                    />
                    <RunnerLayer
                        playerStyle={playerStyle}
                        runnerCharacter={runnerCharacter}
                        runnerMotionStyle={runnerMotionStyle}
                        safeSpeciesId={safeSpeciesId}
                    />

                </div>

                <div className="jello-knight__camera-frame">
                    <div className="jello-knight__camera-ring" />
                </div>
            </div>

            <div className="jello-knight__overlay">
                {damageFlashOpacity > 0 && (
                    <div
                        className="jello-knight__damage-flash"
                        style={{ opacity: damageFlashOpacity }}
                        aria-hidden="true"
                    />
                )}
                {announcement && gamePhase === 'playing' && (
                    <div className={`jello-knight__announcement jello-knight__announcement--${announcement.tone}`}>
                        <span className="jello-knight__announcement-title">{announcement.title}</span>
                        <strong>{announcement.detail}</strong>
                    </div>
                )}
            </div>

            <div
                className="jello-knight__controls"
                ref={controlsRef}
                onPointerDown={handleJoystickPointerDown}
                onPointerMove={handleJoystickPointerMove}
                onPointerUp={handleJoystickPointerUp}
                onPointerCancel={handleJoystickPointerCancel}
                role="presentation"
                aria-label={gt('joystickAriaLabel')}
            >
                <div className="jello-knight__joystick-base" ref={joystickBaseRef}>
                    <div className="jello-knight__joystick-knob" style={joystickKnobStyle} />
                </div>
            </div>
        </div>
    </div>
);

type StartProps = {
    gt: TranslateFn;
    onStart: () => void;
};

export const JelloKnightStartOverlay: React.FC<StartProps> = ({ gt, onStart }) => (
    <PlayArcadeStartOverlay
        title={gt('startTitle')}
        description={gt('startDescription')}
        actionLabel={gt('startButton')}
        onAction={onStart}
        visual={<span className="jello-knight__start-visual">🫧⚔️</span>}
        guides={[
            { keys: ['HUD'], text: gt('startGuides.hud') },
            { keys: ['WASD'], text: gt('startGuides.move') },
            { keys: ['ELITE'], text: gt('startGuides.elite') },
        ]}
    />
);

type LevelUpProps = {
    gt: TranslateFn;
    options: UpgradeOption[];
    onSelect: (optionId: UpgradeOptionId) => void;
};

export const JelloKnightLevelUpOverlay: React.FC<LevelUpProps> = ({ gt, onSelect, options }) => (
    <div className="jello-knight__levelup-overlay">
        <div className="jello-knight__levelup-card">
            <span className="jello-knight__levelup-eyebrow">{gt('levelUp.eyebrow')}</span>
            <h2>{gt('levelUp.title')}</h2>
            <div className="jello-knight__levelup-options">
                {options.map((option) => (
                    <button
                        key={option.id}
                        type="button"
                        className="jello-knight__levelup-option"
                        onClick={() => onSelect(option.id)}
                    >
                        <span className="jello-knight__levelup-option-icon" aria-hidden="true">{option.icon}</span>
                        <div className="jello-knight__levelup-option-body">
                            <div className="jello-knight__levelup-option-copy">
                                <strong>{option.title}</strong>
                                <span>{option.description}</span>
                            </div>
                            {option.isUnlock ? (
                                <div className="jello-knight__levelup-unlock-badge">{gt('levelUp.unlockReady')}</div>
                            ) : (
                                <div className="jello-knight__levelup-stars" aria-hidden="true">
                                    {Array.from({ length: option.maxLevel }, (_, index) => (
                                        <span
                                            key={`${option.id}-star-${index}`}
                                            className={`jello-knight__levelup-star${index < option.currentLevel ? ' is-filled' : ''}`}
                                        >
                                            ★
                                        </span>
                                    ))}
                                </div>
                            )}
                        </div>
                    </button>
                ))}
            </div>
        </div>
    </div>
);

type GameOverProps = {
    bestScore: number;
    bestTimeMs: number;
    wave: number;
    elapsedMs: number;
    gt: TranslateFn;
    lastRunWasBest: boolean;
    rewards: { xp: number; gro: number };
    score: number;
    onRetry: () => void;
};

export const JelloKnightGameOverOverlay: React.FC<GameOverProps> = ({
    bestScore,
    bestTimeMs,
    wave,
    elapsedMs,
    gt,
    lastRunWasBest,
    onRetry,
    rewards,
    score,
}) => (
    <PlayArcadeGameOverOverlay
        title={gt('gameOver.title')}
        retryLabel={gt('gameOver.retryButton')}
        onRetry={onRetry}
        records={[
            {
                label: gt('gameOver.records.score'),
                current: score.toLocaleString(),
                best: bestScore.toLocaleString(),
                highlighted: lastRunWasBest,
                badgeText: lastRunWasBest ? gt('gameOver.newBest') : undefined,
            },
            {
                label: gt('gameOver.records.survival'),
                current: formatRunClock(elapsedMs),
                best: formatRunClock(bestTimeMs),
                tone: 'secondary',
            },
            {
                label: gt('gameOver.records.peakDanger'),
                current: gt('gameOver.records.peakDangerValue', { tier: wave }),
                tone: 'secondary',
            },
        ]}
        rewards={[
            { icon: '✨', label: gt('gameOver.rewards.xp'), value: `+${rewards.xp}`, tone: 'xp' },
            { icon: '🪙', label: gt('gameOver.rewards.gro'), value: `+${rewards.gro}`, tone: 'gro' },
        ]}
    />
);
