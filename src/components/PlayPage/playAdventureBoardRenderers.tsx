import type { BoatMotionAssignment, CreatureMotionAssignment, ForestClusterVariant } from './playAdventureBoardTypes';
import { getOverlayAnimationName } from './playAdventureBoardMotion';

type SeaCreatureEmojiProfile = 'default' | 'fallback';

let cachedSeaCreatureEmojiProfile: SeaCreatureEmojiProfile | null = null;

const renderEmojiCluster = (
    emoji: string,
    clusterClassName = 'play-board-tree-cluster',
    itemClassName = 'play-board-tree',
    slotPrefix: 'tree' | 'object' = 'tree'
) => (
    <span className={clusterClassName} aria-hidden="true">
        <span className={`${itemClassName} ${slotPrefix}-a`}>{emoji}</span>
        <span className={`${itemClassName} ${slotPrefix}-b`}>{emoji}</span>
        <span className={`${itemClassName} ${slotPrefix}-c`}>{emoji}</span>
        <span className={`${itemClassName} ${slotPrefix}-d`}>{emoji}</span>
    </span>
);

const renderCenteredEmoji = (emoji: string, className = 'play-board-centered-object') => (
    <span className={className} aria-hidden="true">
        {emoji}
    </span>
);

const getSeaCreatureEmojiProfile = (): SeaCreatureEmojiProfile => {
    if (cachedSeaCreatureEmojiProfile) return cachedSeaCreatureEmojiProfile;
    if (typeof navigator === 'undefined') return 'default';

    const ua = navigator.userAgent || '';
    const platform = navigator.platform || '';
    const isIOSDevice = /iP(hone|od|ad)/.test(ua) || (platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    const isWindowsDevice = /Windows/i.test(ua) || /Win/i.test(platform);

    if (isWindowsDevice) {
        cachedSeaCreatureEmojiProfile = 'fallback';
        return cachedSeaCreatureEmojiProfile;
    }

    if (!isIOSDevice) {
        cachedSeaCreatureEmojiProfile = 'default';
        return cachedSeaCreatureEmojiProfile;
    }

    const iosVersionMatch = ua.match(/OS (\d+)_/);
    const iosMajorVersion = iosVersionMatch ? parseInt(iosVersionMatch[1], 10) : null;
    const isLegacyIOS = iosMajorVersion !== null && iosMajorVersion <= 15;

    cachedSeaCreatureEmojiProfile = isLegacyIOS ? 'fallback' : 'default';
    return cachedSeaCreatureEmojiProfile;
};

const getSeaCreatureEmoji = (variant: 'fish' | 'jellyfish') => {
    if (variant === 'fish') return '🐟';

    return getSeaCreatureEmojiProfile() === 'fallback' ? '🐢' : '🪼';
};

export const renderBoat = (
    boatMotion: BoatMotionAssignment | null,
    emoji: string,
    className: string,
    onBoatAnimationIteration?: () => void
) => {
    if (!boatMotion) return null;

    return (
        <span
            className={className}
            aria-hidden="true"
            onAnimationIteration={() => {
                if (onBoatAnimationIteration) {
                    onBoatAnimationIteration();
                }
            }}
            style={{
                animation: `${getOverlayAnimationName(boatMotion.animationName, emoji)} ${boatMotion.duration} ease-in-out ${boatMotion.delay} infinite`,
            }}
        >
            {emoji === '🚢' ? (
                <>
                    <span className="play-board-boat-icon left">🚢</span>
                    <span className="play-board-boat-icon right">🚢</span>
                </>
            ) : emoji === '🐫' ? (
                <span
                    className={`play-board-camel-icon ${boatMotion.animationName === 'playBoardBoatRight' ? 'is-flipped' : ''}`}
                >
                    🐫
                </span>
            ) : emoji === '🐘' ? (
                <span
                    className={`play-board-elephant-icon ${boatMotion.animationName === 'playBoardBoatRight' ? 'is-flipped' : ''}`}
                >
                    🐘
                </span>
            ) : emoji === '🐝' ? (
                <span
                    className={`play-board-bee-icon ${boatMotion.animationName === 'playBoardBoatRight' ? 'is-flipped' : ''}`}
                >
                    🐝
                </span>
            ) : (
                <span className="play-board-overlay-sailboat-icon">{emoji}</span>
            )}
        </span>
    );
};

export const renderForestCluster = (
    variant: ForestClusterVariant | null,
    creatureMotion: CreatureMotionAssignment | null,
    tileKey?: string,
    onCreatureAnimationIteration?: (tileKey: string) => void
) => {
    if (!variant) return null;

    switch (variant) {
    case 'island':
        return renderCenteredEmoji('🏝️');
    case 'beach':
        return renderCenteredEmoji('🏖️');
    case 'desert-oasis':
        return renderCenteredEmoji('🏜️');
    case 'fish':
        return creatureMotion ? (
            <span
                className="play-board-scorpion play-board-fish"
                aria-hidden="true"
                onAnimationIteration={() => {
                    if (tileKey && onCreatureAnimationIteration) {
                        onCreatureAnimationIteration(tileKey);
                    }
                }}
                style={{
                    animation: `${creatureMotion.animationName} ${creatureMotion.duration} ease-in-out ${creatureMotion.delay} infinite`,
                    ['--scorpion-scale-x' as string]: creatureMotion.scaleX,
                    ['--creature-angle' as string]: creatureMotion.angle,
                }}
            >
                {getSeaCreatureEmoji('fish')}
            </span>
        ) : null;
    case 'jellyfish':
        return creatureMotion ? (
            <span
                className="play-board-scorpion play-board-fish play-board-jellyfish"
                aria-hidden="true"
                onAnimationIteration={() => {
                    if (tileKey && onCreatureAnimationIteration) {
                        onCreatureAnimationIteration(tileKey);
                    }
                }}
                style={{
                    animation: `${creatureMotion.animationName} ${creatureMotion.duration} ease-in-out ${creatureMotion.delay} infinite`,
                    ['--scorpion-scale-x' as string]: creatureMotion.scaleX,
                    ['--creature-angle' as string]: creatureMotion.angle,
                }}
            >
                {getSeaCreatureEmoji('jellyfish')}
            </span>
        ) : null;
    case 'whale':
        return creatureMotion ? (
            <span
                className="play-board-scorpion play-board-fish play-board-whale"
                aria-hidden="true"
                onAnimationIteration={() => {
                    if (tileKey && onCreatureAnimationIteration) {
                        onCreatureAnimationIteration(tileKey);
                    }
                }}
                style={{
                    animation: `${creatureMotion.animationName} ${creatureMotion.duration} ease-in-out ${creatureMotion.delay} infinite`,
                    ['--scorpion-scale-x' as string]: creatureMotion.scaleX,
                    ['--creature-angle' as string]: creatureMotion.angle,
                }}
            >
                🐳
            </span>
        ) : null;
    case 'pufferfish':
        return creatureMotion ? (
            <span
                className="play-board-scorpion play-board-fish play-board-pufferfish"
                aria-hidden="true"
                onAnimationIteration={() => {
                    if (tileKey && onCreatureAnimationIteration) {
                        onCreatureAnimationIteration(tileKey);
                    }
                }}
                style={{
                    animation: `${creatureMotion.animationName} ${creatureMotion.duration} ease-in-out ${creatureMotion.delay} infinite`,
                    ['--scorpion-scale-x' as string]: creatureMotion.scaleX,
                    ['--creature-angle' as string]: creatureMotion.angle,
                }}
            >
                🐡
            </span>
        ) : null;
    case 'trees':
        return renderEmojiCluster('🌳');
    case 'pines':
        return renderEmojiCluster('🌲');
    case 'sunflowers':
        return renderEmojiCluster('🌻', 'play-board-tree-cluster play-board-flower-cluster');
    case 'tulips':
        return renderEmojiCluster('🌷', 'play-board-tree-cluster play-board-flower-cluster');
    case 'mushrooms':
        return renderEmojiCluster('🍄', 'play-board-tree-cluster play-board-object-cluster play-board-mushroom-cluster', 'play-board-object', 'object');
    case 'woodpile':
        return renderEmojiCluster('🪵', 'play-board-tree-cluster play-board-object-cluster play-board-woodpile-cluster', 'play-board-object', 'object');
    case 'desert-sprouts':
        return renderEmojiCluster('🪾', 'play-board-tree-cluster play-board-desert-cluster');
    case 'cacti':
        return renderEmojiCluster('🌵', 'play-board-tree-cluster play-board-desert-cluster');
    case 'rocks':
        return renderEmojiCluster('🪨', 'play-board-tree-cluster play-board-desert-cluster');
    case 'scorpions':
        return creatureMotion ? (
            <span
                className="play-board-scorpion"
                aria-hidden="true"
                onAnimationIteration={() => {
                    if (tileKey && onCreatureAnimationIteration) {
                        onCreatureAnimationIteration(tileKey);
                    }
                }}
                style={{
                    animation: `${creatureMotion.animationName} ${creatureMotion.duration} ease-in-out ${creatureMotion.delay} infinite`,
                    ['--scorpion-scale-x' as string]: creatureMotion.scaleX,
                    ['--creature-angle' as string]: creatureMotion.angle,
                }}
            >
                🦂
            </span>
        ) : null;
    case 'beetles':
        return creatureMotion ? (
            <span
                className="play-board-scorpion play-board-beetle"
                aria-hidden="true"
                onAnimationIteration={() => {
                    if (tileKey && onCreatureAnimationIteration) {
                        onCreatureAnimationIteration(tileKey);
                    }
                }}
                style={{
                    animation: `${creatureMotion.animationName} ${creatureMotion.duration} ease-in-out ${creatureMotion.delay} infinite`,
                    ['--scorpion-scale-x' as string]: creatureMotion.scaleX,
                    ['--creature-angle' as string]: creatureMotion.angle,
                }}
            >
                🪲
            </span>
        ) : null;
    default:
        return null;
    }
};
