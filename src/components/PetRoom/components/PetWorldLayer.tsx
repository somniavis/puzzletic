import React from 'react';
import { useTranslation } from 'react-i18next';
import { SurpriseTrain } from '../../SurpriseTrain';
import { JelloHouse } from '../JelloHouse';
import { RoomBackground } from '../RoomBackground';
import { Poop } from '../../Poop/Poop';
import { Bug } from '../../Bug/Bug';
import { GiftBox } from '../../GiftBox/GiftBox';
import { JelloAvatar } from '../../characters/JelloAvatar';
import { EmotionBubble } from '../../EmotionBubble/EmotionBubble';
import { useNurturing } from '../../../contexts/NurturingContext';
import type { Character, CharacterMood, CharacterAction } from '../../../types/character';
import { CHARACTER_SPECIES_CORE } from '../../../data/speciesCore';
import { ActivePet } from './ActivePet';

interface PetWorldLayerProps {
    // States
    showGiftBox: boolean;
    isTrainActive: boolean;
    mood: CharacterMood;
    action: CharacterAction;
    character: Character;

    // Animation States
    lightningStyle: React.CSSProperties;
    flyingFood: { icon: string; key: number; type: 'food' | 'pill' | 'syringe' } | null;
    position: { x: number; y: number };
    bubble: { category: any; level: 1 | 2 | 3; key: number } | null;
    bubbles: { id: number; left: number; size: number; delay: number; duration: number }[];

    // Interaction Status
    isShowering: boolean;
    isCleaning: boolean;
    isBrushing: boolean;
    activeCleaningToolId: string | null;
    poopCleanupTarget: { id: string; token: number } | null;
    bugCleanupTarget: { id: string; token: number } | null;

    // Handlers
    onOpenTrainGift: (rect: DOMRect) => void;
    onTrainComplete: () => void;
    onHouseClick: () => void;
    onPoopClick: (id: string, bonus?: number) => void;
    onBugClick: (id: string) => void;
    onCharacterClick: () => void;
    onGiftBoxClick: () => void;
    onJelloClick: () => void;

    nurturing: ReturnType<typeof useNurturing>;
}

export const PetWorldLayer: React.FC<PetWorldLayerProps> = ({
    showGiftBox,
    isTrainActive,
    mood,
    action,
    character,
    lightningStyle,
    flyingFood,
    position,
    bubble,
    bubbles,
    isShowering,
    isCleaning,
    isBrushing,
    activeCleaningToolId,
    poopCleanupTarget,
    bugCleanupTarget,
    onOpenTrainGift,
    onTrainComplete,
    onHouseClick,
    onPoopClick,
    onBugClick,
    onCharacterClick,
    onGiftBoxClick,
    onJelloClick,
    nurturing
}) => {
    const { t } = useTranslation();

    // Helper to get personality
    const species = CHARACTER_SPECIES_CORE[character.speciesId];
    const personality = species?.personality;

    return (
        <div className="room-container">
            {/* Surprise Train Layer */}
            <SurpriseTrain
                isActive={isTrainActive}
                onOpenGift={onOpenTrainGift}
                onComplete={onTrainComplete}
            />

            {/* House (Action Bar area in original but visually in room) */}
            {!showGiftBox && (
                <JelloHouse
                    type={nurturing.currentHouseId}
                    isSleeping={nurturing.isSleeping}
                    onClick={onHouseClick}
                    style={{
                        left: '10%',
                        bottom: '25%'
                    }}
                />
            )}

            {/* Abandonment Alert */}
            {nurturing.abandonmentStatus.level !== 'normal' && nurturing.abandonmentStatus.level !== 'abandoned' && (
                <div className={`abandonment-alert abandonment-alert--${nurturing.abandonmentStatus.level}`}>
                    <span className="abandonment-alert__icon">
                        {nurturing.abandonmentStatus.level === 'leaving' && '⚠️'}
                        {nurturing.abandonmentStatus.level === 'critical' && '⚠️'}
                        {nurturing.abandonmentStatus.level === 'danger' && '⚠️'}
                    </span>
                    <span className="abandonment-alert__text">
                        {t(nurturing.abandonmentStatus.message as any, {
                            countdown: nurturing.abandonmentStatus.countdown || '',
                        })}
                    </span>
                </div>
            )}

            {/* Death UI Overlay */}
            {nurturing.abandonmentStatus.level === 'abandoned' && (
                <div className="death-overlay">
                    <div className="death-container">
                        <div className="ghost">👻</div>
                        <div className="tombstone">🪦</div>
                    </div>
                    <div className="death-message">
                        {t('abandonment.abandoned')}
                    </div>
                    <button className="reset-btn" onClick={nurturing.resetGame}>
                        {t('game.reset')}
                    </button>
                </div>
            )}

            <RoomBackground
                background={nurturing.currentLand}
                showGiftBox={showGiftBox}
                lightningStyle={lightningStyle}
            />

            {/* Poops */}
            {!showGiftBox && nurturing.poops.map((poop) => (
                <Poop
                    key={poop.id}
                    poop={poop}
                    onClick={() => onPoopClick(poop.id)}
                    cleanupTrigger={poopCleanupTarget?.id === poop.id ? poopCleanupTarget.token : undefined}
                />
            ))}

            {/* Bugs */}
            {!showGiftBox && nurturing.bugs.map((bug) => (
                <Bug
                    key={bug.id}
                    bug={bug}
                    onClick={onBugClick}
                    cleanupTrigger={bugCleanupTarget?.id === bug.id ? bugCleanupTarget.token : undefined}
                />
            ))}

            {/* Active Pet */}
            {!showGiftBox && nurturing.currentPetId && (
                <ActivePet petId={nurturing.currentPetId} />
            )}

            {/* Flying Food Animation */}
            {flyingFood && (
                <div
                    key={flyingFood.key}
                    className={flyingFood.type === 'syringe' ? 'injecting-medicine' : 'eating-food'}
                    style={{
                        left: `${position.x}%`,
                        bottom: `${position.y - (window.innerWidth <= 768 ? 9 : 7) + 0.8}%`,
                    }}
                >
                    {flyingFood.icon}
                </div>
            )}

            {/* Character (Visible if not abandoned and not sleeping) */}
            {nurturing.abandonmentStatus.level !== 'abandoned' && !nurturing.isSleeping && (
                <div
                    className="character-container"
                    style={{
                        left: showGiftBox ? '50%' : `${position.x}%`,
                        bottom: showGiftBox ? '50%' : `${position.y}%`,
                        transform: 'translate(-50%, 50%)',
                    }}
                    onClick={onCharacterClick}
                >
                    {bubble && (
                        <EmotionBubble
                            key={bubble.key}
                            category={bubble.category}
                            level={bubble.level}
                            personality={personality}
                            stage={character.evolutionStage}
                        />
                    )}
                    {/* Sick Status - Bandaid */}
                    {nurturing.isSick && !showGiftBox && (
                        <div className="sick-bandaid">
                            <span className="bandaid-cross bandaid-left">🩹</span>
                            <span className="bandaid-cross bandaid-right">🩹</span>
                        </div>
                    )}
                    {/* Sick Status - Thermometer */}
                    {nurturing.isSick && !showGiftBox && (
                        <div className="sick-thermometer">🌡️</div>
                    )}

                    {/* Effect Overlays */}
                    {isShowering && <div className="shower-effect">🚿</div>}

                    {isCleaning && activeCleaningToolId === 'robot_cleaner' && <div className="cleaning-effect">🖲️</div>}
                    {isCleaning && activeCleaningToolId === 'max_stats' && <div className="cleaning-effect">🌟</div>}

                    {isBrushing && <div className="brushing-effect">🪥</div>}

                    {/* Shower Bubbles */}
                    {isShowering && (
                        <div className="bubble-container">
                            {bubbles.map((b) => (
                                <span
                                    key={b.id}
                                    className="bubble"
                                    style={{
                                        left: `${b.left}%`,
                                        animationDelay: `${b.delay}s`,
                                        animationDuration: `${b.duration}s`,
                                        fontSize: `${b.size}px`,
                                    }}
                                >
                                    🫧
                                </span>
                            ))}
                        </div>
                    )}

                    {showGiftBox ? (
                        <div style={{ pointerEvents: 'auto' }}>
                            <GiftBox onOpen={onGiftBoxClick} />
                        </div>
                    ) : (
                        <>
                            <div className="jello-shadow"></div>
                            <div
                                style={{ pointerEvents: 'auto' }}
                                className={`jello-wrapper ${character.evolutionStage === 5 ? 'legendary' : ''} ${character.evolutionStage <= 2 ? 'baby' : ''}`}
                                onClick={(e) => {
                                    e.stopPropagation(); // Avoid double triggering container click if needed
                                    onJelloClick();
                                }}
                            >
                                <JelloAvatar
                                    character={character}
                                    responsive={true}
                                    mood={mood}
                                    action={action}
                                />
                            </div>
                        </>
                    )}
                </div>
            )}
        </div>
    );
};
