import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import type { Character, CharacterMood, CharacterAction } from '../../types/character';
import type { CharacterSpeciesId } from '../../data/species';
import type { EmotionCategory } from '../../types/emotion';
import { useNurturing } from '../../contexts/NurturingContext';
import { startBackgroundMusic, playButtonSound, playCleaningSound, playEatingSound } from '../../utils/sound';
// import { ActionResultModal } from './ActionResultModal'; // Placeholder, verify location
import { CameraModal } from './CameraModal'; // Confirmed in PetRoom dir
import { GiftBoxModal } from '../GiftBoxModal'; // Confirmed in components
import { SignupPromoModal } from '../SignupPromoModal'; // Confirmed in components
import { EvolutionOverlay } from './EvolutionOverlay';
import { ConfirmModal } from './ConfirmModal'; // Confirmed in PetRoom
import { FabMenu } from './FabMenu'; // Confirmed in PetRoom
import { TrainRewardModal } from '../TrainRewardModal'; // Will update if index.tsx exists
import { EvolutionControls } from './EvolutionControls';
import { PremiumPurchaseModal } from '../Premium/PremiumPurchaseModal';

// Hooks
import { usePetRoomUI } from './hooks/usePetRoomUI';
import { usePetInteraction } from './hooks/usePetInteraction';
import { usePetActions } from './hooks/usePetActions';
import { usePetCamera } from './hooks/usePetCamera';

// Components
import { PetRoomHeader } from './components/PetRoomHeader';
import { PetWorldLayer } from './components/PetWorldLayer';
import { PetRoomMenus } from './components/PetRoomMenus';
import { PetActionButtons } from './components/PetActionButtons';

interface PetRoomProps {
  character: Character;
  speciesId: CharacterSpeciesId;

  showGiftBox?: boolean;
  onOpenGift?: () => void;
  mood?: CharacterMood;
  action?: CharacterAction;
  onMoodChange?: (mood: CharacterMood) => void;
  onActionChange?: (action: CharacterAction) => void;
}

export const PetRoom: React.FC<PetRoomProps> = ({
  character,
  speciesId,

  showGiftBox = false,
  onOpenGift,
  mood = 'neutral',
  action = 'idle',
  onActionChange
}) => {
  const { t } = useTranslation();
  const nurturing = useNurturing();

  // Resume tick safety check
  useEffect(() => {
    if (!showGiftBox) nurturing.resumeTick();
  }, [nurturing.resumeTick, showGiftBox]);

  // Global Audio Initialization
  useEffect(() => {
    const handleFirstInteraction = () => {
      startBackgroundMusic();
      window.removeEventListener('click', handleFirstInteraction);
      window.removeEventListener('touchstart', handleFirstInteraction);
    };
    window.addEventListener('click', handleFirstInteraction);
    window.addEventListener('touchstart', handleFirstInteraction);
    return () => {
      window.removeEventListener('click', handleFirstInteraction);
      window.removeEventListener('touchstart', handleFirstInteraction);
    };
  }, []);

  // --- Hooks Initialization ---

  // Lifted Bubble State (Must be defined BEFORE hooks that use it)
  const [bubble, setBubble] = useState<{ category: EmotionCategory; level: 1 | 2 | 3; key: number } | null>(null);
  const bubbleTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showBubble = useCallback((category: EmotionCategory, level: 1 | 2 | 3, duration: number = 3000) => {
    // Clear existing timeout to prevent premature hiding
    if (bubbleTimeoutRef.current) {
      clearTimeout(bubbleTimeoutRef.current);
    }

    setBubble({ category, level, key: Date.now() });

    bubbleTimeoutRef.current = setTimeout(() => {
      setBubble(null);
      bubbleTimeoutRef.current = null;
    }, duration);
  }, []);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (bubbleTimeoutRef.current) {
        clearTimeout(bubbleTimeoutRef.current);
      }
    };
  }, []);

  // 1. UI State
  const ui = usePetRoomUI(showGiftBox);

  // 2. Actions (Needs showBubble)
  const actions = usePetActions({
    onActionChange,
    showBubble,
    action
  });

  // 3. Interaction (Needs showBubble + isShowering from actions)
  const interaction = usePetInteraction({
    speciesId,


    onActionChange,
    action,
    showGiftBox,
    isShowering: actions.states.isShowering,
    showBubble,
    bubble
  });

  // --- External Logic Hooks ---
  const camera = usePetCamera({ character, speciesId, nurturing });

  // --- Lighting State ---
  const [lightningStyle, setLightningStyle] = useState<React.CSSProperties>({});
  useEffect(() => {
    if (nurturing.currentLand === 'volcanic_ground') {
      const updateLightning = () => {
        setLightningStyle({
          top: `${Math.random() * 15 + 2}%`,
          left: `${Math.random() * 25 + 5}%`,
          animationDelay: `${Math.random() * 2}s`
        });
      };
      updateLightning();
      const interval = setInterval(updateLightning, 8000);
      return () => clearInterval(interval);
    }
  }, [nurturing.currentLand]);

  // --- FAB State ---
  const [isFabOpen, setIsFabOpen] = useState(() => {
    const saved = localStorage.getItem('petRoom_fabOpen');
    return saved !== null ? saved === 'true' : true;
  });
  useEffect(() => {
    localStorage.setItem('petRoom_fabOpen', String(isFabOpen));
  }, [isFabOpen]);

  // --- Surprise Train Logic ---
  const [isTrainActive, setIsTrainActive] = useState(false);
  const [pendingTrainReward, setPendingTrainReward] = useState<{
    type: 'small' | 'snack' | 'big' | 'dud';
    amount: number;
  } | null>(null);

  useEffect(() => {
    const lastTrainTime = parseInt(localStorage.getItem('lastTrainTime') || '0', 10);
    const now = Date.now();
    const COOLDOWN = 30 * 60 * 1000;
    const forceTrain = localStorage.getItem('FORCE_TRAIN') === 'true';

    if (forceTrain || (now - lastTrainTime > COOLDOWN)) {
      if (forceTrain || Math.random() < 0.5) {
        setTimeout(() => {
          setIsTrainActive(true);
          localStorage.setItem('lastTrainTime', now.toString());
          if (forceTrain) localStorage.removeItem('FORCE_TRAIN');
        }, 2000);
      }
    }
  }, []);

  const handleTrainComplete = () => setIsTrainActive(false);

  const handleOpenTrainGift = (_: DOMRect) => {
    const rand = Math.random();
    let rewardType: 'small' | 'snack' | 'dud' | 'big' = 'small';
    let amount = 0;

    if (rand < 0.42) { rewardType = 'small'; amount = 10 + Math.floor(Math.random() * 40); }
    else if (rand < 0.72) { rewardType = 'snack'; amount = 50; }
    else if (rand < 0.97) { rewardType = 'dud'; amount = 0; }
    else { rewardType = 'big'; amount = 100 + Math.floor(Math.random() * 200); }

    setPendingTrainReward({ type: rewardType, amount });
  };

  const handleConfirmTrainReward = () => {
    if (!pendingTrainReward) return;
    const { type, amount } = pendingTrainReward;
    if (type === 'dud') {
      playCleaningSound();
      showBubble('worried', 3);
      onActionChange?.('jumping');
      setTimeout(() => onActionChange?.('idle'), 2000);
    } else {
      nurturing.addRewards(0, amount);
      if (type === 'big') showBubble('joy', 3);
      else if (type === 'snack') { playEatingSound(); showBubble('playful', 2); }
      else showBubble('joy', 2);
    }
    setPendingTrainReward(null);
  };

  // --- Interaction Lock ---
  const interactionLockRef = useRef(false);

  // --- Sleep Confirm Handler ---
  const handleConfirmSleepWake = () => {
    interactionLockRef.current = true;
    setTimeout(() => { interactionLockRef.current = false; }, 800);

    if (ui.modals.confirmModalType === 'wake') {
      nurturing.toggleSleep();
      showBubble('neutral', 1);
    } else if (ui.modals.confirmModalType === 'sleep') {
      nurturing.toggleSleep();
    }
    ui.modals.setConfirmModalType(null);
  };

  const handleHouseClick = () => {
    if (interactionLockRef.current) return;
    playButtonSound();
    if (nurturing.isSleeping) {
      ui.modals.setConfirmModalType('wake');
      return;
    }
    if (actions.isActionInProgress) return;
    ui.modals.setConfirmModalType('sleep');
  };

  const handleNicknameComplete = (nickname: string) => {
    ui.modals.setShowNicknameModal(false);
    if (nickname) nurturing.setCharacterName(nickname);
  };

  // --- Evolution Premium Lock & Premium Modal ---
  const [showPremiumModal, setShowPremiumModal] = useState(false);

  const handleEvolutionTrigger = () => {
    // Level 3 -> 4 Lock (Premium Only)
    // evolutionStage 3 means current level is 3. Trying to evolve to 4.
    if (nurturing.evolutionStage === 3 && !nurturing.subscription.isPremium) {
      playButtonSound();
      setShowPremiumModal(true);
      return;
    }
    nurturing.triggerEvolution();
  };

  return (
    <div className="pet-room">
      <div className="pet-room-content" ref={camera.petRoomRef} style={{ flex: 1, display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden' }}>

        {/* Loading Overlay */}
        {ui.isLoading && (
          <div className="loading-overlay">
            <div className="loading-spinner-container">
              <div className="loading-spinner">🐾</div>
              <div className="loading-text">{t('common.loading')}</div>
            </div>
          </div>
        )}

        <PetRoomHeader
          character={character}
          showGiftBox={showGiftBox}
          mood={mood}
          action={action}
        />

        {/* FAB Menu Layer */}
        <div style={{ position: 'relative', width: '100%', height: 0, zIndex: 20 }}>
          <EvolutionControls
            evolutionPhase={nurturing.evolutionPhase}
            showGiftBox={showGiftBox}
            isActionInProgress={actions.isActionInProgress}
            triggerEvolution={handleEvolutionTrigger}
            triggerGraduation={nurturing.triggerGraduation}
          />

          <FabMenu
            isFabOpen={isFabOpen}
            setIsFabOpen={setIsFabOpen}
            toggleShopMenu={() => ui.menus.setShowShopMenu(!ui.menus.showShopMenu)}
            handleCameraClick={camera.handleCameraClick}
            showGiftBox={showGiftBox}
            isActionInProgress={actions.isActionInProgress}
            onPremiumClick={() => setShowPremiumModal(true)}
          />
        </div>

        {/* World Layer */}
        <PetWorldLayer
          showGiftBox={showGiftBox}
          isTrainActive={isTrainActive}
          mood={mood}
          action={action}
          character={character}
          lightningStyle={lightningStyle}
          flyingFood={actions.states.flyingFood}
          position={interaction.position}
          bubble={bubble}
          bubbles={interaction.bubbles}
          isShowering={actions.states.isShowering}
          isCleaning={actions.states.isCleaning}
          isBrushing={actions.states.isBrushing}
          activeCleaningToolId={actions.states.activeCleaningToolId}
          onOpenTrainGift={handleOpenTrainGift}
          onTrainComplete={handleTrainComplete}
          onHouseClick={handleHouseClick}
          onPoopClick={actions.handlers.handlePoopClick}
          onBugClick={actions.handlers.handleBugClick}
          onCharacterClick={interaction.handleCharacterClick}
          onGiftBoxClick={onOpenGift || (() => { })}
          onJelloClick={interaction.handleCharacterClick}
          nurturing={nurturing}
        />
      </div>

      {/* Menus */}
      <PetRoomMenus
        {...ui.menus}
        {...ui.selections}
        onFeed={actions.handlers.handleFeed}
        onGiveMedicine={actions.handlers.handleGiveMedicine}
        onClean={actions.handlers.handleClean}
        onShopItemClick={actions.handlers.handleShopItemClick}
        nurturing={nurturing}
        action={action}
        flyingFood={actions.states.flyingFood}
      />

      {/* Action Bar */}
      <PetActionButtons
        nurturing={nurturing}
        isActionInProgress={actions.isActionInProgress}
        showGiftBox={showGiftBox}
        action={action}
        onToggleFood={() => ui.menus.setShowFoodMenu(!ui.menus.showFoodMenu)}
        onToggleMedicine={() => ui.menus.setShowMedicineMenu(!ui.menus.showMedicineMenu)}
        onToggleClean={() => ui.menus.setShowCleanMenu(!ui.menus.showCleanMenu)}
        onOpenSettings={() => ui.menus.setShowSettingsMenu(true)}
      />

      {/* Modals */}
      {ui.modals.showNicknameModal && (
        <GiftBoxModal onComplete={handleNicknameComplete} />
      )}

      {nurturing.showSignupModal && (
        <SignupPromoModal
          onClose={() => nurturing.setShowSignupModal(false)}
          onSignup={() => nurturing.setShowSignupModal(false)} // Navigation handled inside component
        />
      )}

      {camera.showCameraModal && (
        <CameraModal
          imageDataUrl={camera.capturedImage}
          shareUrl={camera.currentShareUrl}
          onClose={() => camera.setShowCameraModal(false)}
        />
      )}

      {ui.modals.confirmModalType && (
        <ConfirmModal
          title={ui.modals.confirmModalType === 'sleep' ? t('sleep.confirm.sleepTitle') : t('sleep.confirm.wakeTitle')}
          message={
            ui.modals.confirmModalType === 'sleep'
              ? t('sleep.confirm.sleepMessage')
              : t('sleep.confirm.wakeMessage')
          }
          confirmLabel={t('common.yes')}
          cancelLabel={t('common.no')}
          onConfirm={handleConfirmSleepWake}
          onCancel={() => {
            interactionLockRef.current = true;
            setTimeout(() => { interactionLockRef.current = false; }, 800);
            ui.modals.setConfirmModalType(null);
          }}
        />
      )}

      {pendingTrainReward && (
        <TrainRewardModal
          rewardType={pendingTrainReward.type}
          amount={pendingTrainReward.amount}
          onConfirm={handleConfirmTrainReward}
        />
      )}

      <EvolutionOverlay />

      <PremiumPurchaseModal
        isOpen={showPremiumModal}
        onClose={() => setShowPremiumModal(false)}
      />
    </div>
  );
};

export default PetRoom;
