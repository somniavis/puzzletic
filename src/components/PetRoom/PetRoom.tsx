import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import type { Character, CharacterMood, CharacterAction } from '../../types/character';
import { JelloAvatar } from '../characters/JelloAvatar';
import { FOOD_ITEMS, FOOD_CATEGORIES, type FoodItem, type FoodCategory } from '../../types/food';
import { MEDICINE_ITEMS, type MedicineItem } from '../../types/medicine';
import { CLEANING_TOOLS, type CleaningTool } from '../../types/cleaning';
import type { CharacterSpeciesId } from '../../data/species';
import { CHARACTER_SPECIES } from '../../data/species';
import { SHOP_ITEMS, SHOP_CATEGORIES, type ShopItem, type ShopCategory } from '../../types/shop';
import { EmotionBubble } from '../EmotionBubble/EmotionBubble';
import type { EmotionCategory } from '../../types/emotion';
import { useNurturing } from '../../contexts/NurturingContext';
import { useEmotionBubbles } from '../../hooks/useEmotionBubbles';
import { Poop } from '../Poop/Poop';
import { Bug } from '../Bug/Bug';
import { SettingsMenu } from '../SettingsMenu/SettingsMenu';
import { GiftBox } from '../GiftBox/GiftBox';
import { calculateClickResponse, getClickEmotionCategory } from '../../constants/personality';
import { playButtonSound, playJelloClickSound, playEatingSound, playCleaningSound, startBackgroundMusic } from '../../utils/sound';
import { RoomBackground } from './RoomBackground';
import { MenuModal } from './MenuModal';
import { GiftBoxModal } from '../GiftBoxModal';
import { JelloHouse } from './JelloHouse';
import { ConfirmModal } from './ConfirmModal';
import { CameraModal } from './CameraModal';
import { toPng } from 'html-to-image';
import { generateShareUrl, type ShareData } from '../../utils/shareUtils';
import './PetRoom.css';

import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

interface PetRoomProps {
  character: Character;
  speciesId: CharacterSpeciesId;
  onStatsChange: (stats: Partial<Character['stats']>) => void;
  showGiftBox?: boolean;
  onOpenGift?: () => void;
  mood?: CharacterMood;
  action?: CharacterAction;
  onMoodChange?: (mood: CharacterMood) => void;
  onActionChange?: (action: CharacterAction) => void;
}

// Utility to ensure all images in the container are loaded
// Utility to ensure all images in the container are loaded and DECODED
const waitForImages = async (element: HTMLElement) => {
  const images = Array.from(element.getElementsByTagName('img'));
  const promises = images.map(async (img) => {
    if (img.complete && img.naturalHeight !== 0) {
      // Already loaded, but ensure decoded for expensive assets
      try {
        await img.decode();
      } catch (e) {
        // decode can fail if image is broken, ignore
      }
      return;
    }
    return new Promise<void>((resolve) => {
      img.onload = async () => {
        try {
          await img.decode();
        } catch (e) { }
        resolve();
      };
      img.onerror = () => resolve();
    });
  });
  await Promise.all(promises);
};

export const PetRoom: React.FC<PetRoomProps> = ({
  character,
  speciesId,
  onStatsChange,
  showGiftBox = false,
  onOpenGift,
  mood = 'neutral',
  action = 'idle',
  onActionChange
}) => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  // 양육 시스템 사용
  const nurturing = useNurturing();
  const { user } = useAuth();

  // Resume tick when entering Pet Room (safety check)
  useEffect(() => {
    if (!showGiftBox) {
      nurturing.resumeTick();
    }
  }, [nurturing.resumeTick, showGiftBox]);

  // Loading State
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate loading delay for better UX (preloading assets masking)
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  // Global Interaction Listener for Lazy BGM Start
  useEffect(() => {
    const handleFirstInteraction = () => {
      startBackgroundMusic();
      // Remove listeners after first attempt
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


  /* ========== State Management ========== */
  const interactionLockRef = useRef(false); // Mobile ghost click prevention
  const [position, setPosition] = useState({ x: 50, y: 50 }); // percentage position
  const [isMoving, setIsMoving] = useState(false);
  const [showFoodMenu, setShowFoodMenu] = useState(false);
  const [showCleanMenu, setShowCleanMenu] = useState(false);
  const [showMedicineMenu, setShowMedicineMenu] = useState(false);
  const [showShopMenu, setShowShopMenu] = useState(false);
  const [showSettingsMenu, setShowSettingsMenu] = useState(false);
  const [selectedFoodCategory, setSelectedFoodCategory] = useState<FoodCategory>('fruit');
  const [selectedShopCategory, setSelectedShopCategory] = useState<ShopCategory>('ground');
  const [bubble, setBubble] = useState<{ category: EmotionCategory; level: 1 | 2 | 3; key: number } | null>(null);
  const [flyingFood, setFlyingFood] = useState<{ icon: string; key: number; type: 'food' | 'pill' | 'syringe' } | null>(null);
  const [isShowering, setIsShowering] = useState(false);
  const [isBrushing, setIsBrushing] = useState(false);
  const [isCleaning, setIsCleaning] = useState(false);
  // Modal visibility now defaults to false, but we'll trigger it via useEffect if needed
  const [activeCleaningToolId, setActiveCleaningToolId] = useState<string | null>(null);
  // Modal visibility
  const [showNicknameModal, setShowNicknameModal] = useState(false);
  // Manual sequence lock to bridge gaps between animation states (e.g. food disappearing -> action starting)
  const [isSequenceActive, setIsSequenceActive] = useState(false);

  // Confirmation Modal State for Sleep/Wake
  const [confirmModalType, setConfirmModalType] = useState<'sleep' | 'wake' | null>(null);

  // FAB (Floating Action Button) Menu State
  const [isFabOpen, setIsFabOpen] = useState(() => {
    const saved = localStorage.getItem('petRoom_fabOpen');
    return saved !== null ? saved === 'true' : true;
  });

  useEffect(() => {
    localStorage.setItem('petRoom_fabOpen', String(isFabOpen));
  }, [isFabOpen]);

  // Camera & Share State
  const petRoomRef = useRef<HTMLDivElement>(null);
  const [showCameraModal, setShowCameraModal] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string>('');
  const [currentShareUrl, setCurrentShareUrl] = useState<string>('');

  const handleCameraClick = async () => {
    if (!petRoomRef.current) return;

    try {
      playButtonSound();

      // 1. Wait for all images to fully load BEFORE any modal state change
      await waitForImages(petRoomRef.current);

      // 2. Small buffer for final rendering (shadows, styles)
      await new Promise(resolve => setTimeout(resolve, 100));

      if (!petRoomRef.current) return;

      // 3. Add snapshot-mode class to disable box-shadows
      petRoomRef.current.classList.add('snapshot-mode');

      // 4. Capture the snapshot
      const width = petRoomRef.current.clientWidth;
      const height = petRoomRef.current.clientHeight;

      let dataUrl: string;
      try {
        dataUrl = await toPng(petRoomRef.current, {
          cacheBust: true,
          pixelRatio: 2,
          skipAutoScale: true,
          width: width,
          height: height,
          style: {
            width: `${width}px`,
            height: `${height}px`,
          },
          filter: (node) => {
            const excludeClasses = [
              'camera-modal-overlay',
              'action-bar',
              'fab-menu-container',
              'settings-menu-overlay',
              'premium-btn-floating',
              'abandonment-alert',
              'premium-btn'
            ];
            if (node.classList) {
              for (const cls of excludeClasses) {
                if (node.classList.contains(cls)) return false;
              }
            }
            return true;
          },
        });
      } finally {
        // 5. Remove snapshot-mode class after capture
        petRoomRef.current?.classList.remove('snapshot-mode');
      }

      const shareData: ShareData = {
        c: speciesId,
        e: character.evolutionStage,
        n: character.name,
        h: nurturing.currentHouseId || 'tent',
        g: nurturing.currentLand,
        l: character.level
      };

      const shareUrl = generateShareUrl(shareData);

      // 4. Set capturedresults, THEN show modal (after capture is complete)
      setCapturedImage(dataUrl);
      setCurrentShareUrl(shareUrl);
      setShowCameraModal(true);

    } catch (err) {
      console.error('Failed to capture image:', err);
    }
  };

  // Auto-show modal AFTER box is opened (character exists, but no name set yet)
  useEffect(() => {
    // If box is NOT showing (means we have a character) AND nickname is not persisted/set
    if (!showGiftBox && !nurturing.characterName && !showNicknameModal) {
      // Delay for smooth transition after box opens
      const timer = setTimeout(() => {
        setShowNicknameModal(true);
      }, 1500); // 1.5s delay
      return () => clearTimeout(timer);
    }
  }, [showGiftBox, nurturing.characterName, showNicknameModal]);

  // When box is clicked (after nickname is set), just open the gift
  const handleGiftBoxClick = () => {
    onOpenGift?.();
  };

  const handleNicknameComplete = (nickname: string) => {
    setShowNicknameModal(false);
    // Update context persistence
    if (nickname) {
      nurturing.setCharacterName(nickname);
    }
  };

  const showBubble = (category: EmotionCategory, level: 1 | 2 | 3) => {
    setBubble({ category, level, key: Date.now() });
    setTimeout(() => setBubble(null), 3000); // Hide bubble after 3 seconds
  };

  const bubbles = useMemo(() => {
    if (!isShowering) return [];
    return Array.from({ length: 20 }).map((_, i) => ({
      id: i,
      left: Math.random() * 100,
      size: 10 + Math.random() * 20,
      delay: Math.random() * 2,
      duration: 3 + Math.random() * 2,
    }));
  }, [isShowering]);



  // 젤로 자동 이동 (랜덤) - GiftBox 모드일 때는 이동 중지
  useEffect(() => {
    if (showGiftBox) return;

    const moveRandomly = () => {
      if (isMoving || action !== 'idle' || isShowering) return;

      // 30% 확률로 이동
      if (Math.random() > 0.3) return;

      const newX = 6 + Math.random() * 88; // 6% ~ 94%
      const newY = 6 + Math.random() * 69; // 6% ~ 75%

      setIsMoving(true);
      setPosition({ x: newX, y: newY });

      setTimeout(() => {
        setIsMoving(false);
      }, 1000); // 이동 시간
    };

    const interval = setInterval(moveRandomly, 3000);
    return () => clearInterval(interval);
  }, [isMoving, action, isShowering, showGiftBox]);

  // 상태 변화에 따른 무드/액션 업데이트 - Custom Hook 사용
  useEmotionBubbles({
    stats: nurturing.stats,
    condition: nurturing.condition,
    poops: nurturing.poops,
    showBubble,
    bubble
  });

  // 건강 상태에 따른 아이콘 반환
  const getHealthIcon = (health: number): string => {
    if (health >= 80) return '💖';  // 별 하트
    if (health >= 50) return '❤️';  // 빨간 하트
    if (health >= 30) return '💔';  // 깨진 하트
    if (health >= 10) return '🩶';  // 회색 하트
    return '🖤';  // 검은 하트
  };

  // 행복도에 따른 아이콘 반환
  const getHappinessIcon = (happiness: number): string => {
    if (happiness >= 80) return '😍';  // 하트 눈 웃음
    if (happiness >= 60) return '😊';  // 웃는 얼굴
    if (happiness >= 40) return '🙂';  // 미소
    if (happiness >= 20) return '😔';  // 슬픔
    return '😭';  // 우는 얼굴
  };

  const handleFeed = (food: FoodItem) => {
    if (nurturing.gro < food.price) {
      showBubble('worried', 2); // Not enough money
      return;
    }
    nurturing.spendGro(food.price);
    playButtonSound();
    setShowFoodMenu(false);

    // 음식 먹는 애니메이션 시작 + 사운드
    setIsSequenceActive(true);
    setFlyingFood({ icon: food.icon, key: Date.now(), type: 'food' });
    playEatingSound();

    // 애니메이션 완료 후 실제 먹이기 실행
    // 애니메이션 완료 후 실제 먹이기 실행
    setTimeout(() => {
      setFlyingFood(null); // 1. Remove food first

      // 2. Short buffer to ensure food is gone before jello starts moving
      setTimeout(() => {
        onActionChange?.('eating');

        // 양육 시스템으로 먹이기 실행
        const result = nurturing.feed(food);

        if (result.success) {
          // 500ms 후 행복한 상태로 전환 (약 먹기 로직과 동일하게 맞춤)
          setTimeout(() => {
            showBubble('playful', 1);
            onActionChange?.('happy');

            // 똥 생성시 알림
            if (result.sideEffects?.poopCreated) {
              setTimeout(() => {
                showBubble('neutral', 1);
              }, 1500);
            }

            setTimeout(() => {
              onActionChange?.('idle');
              setIsSequenceActive(false); // Sequence finished
            }, 2000);
          }, 500);
        } else {
          // 실패 시 바로 복귀
          setTimeout(() => {
            onActionChange?.('idle');
            setIsSequenceActive(false);
          }, 1500);
        }
      }, 100); // 100ms buffer

    }, 1200); // 애니메이션 시간 (1.2s)
  };

  const toggleFoodMenu = () => {
    playButtonSound();
    setShowFoodMenu(!showFoodMenu);
  };

  const toggleShopMenu = () => {
    playButtonSound();
    setShowShopMenu(!showShopMenu);
  };

  const handleShopItemClick = (item: ShopItem) => {
    playButtonSound();

    // Check ownership
    const isOwned = nurturing.inventory.includes(item.id);

    if (isOwned) {
      // Equip if owned
      if (item.category === 'ground') {
        nurturing.equipLand(item.id);
        showBubble('joy', 1);
      } else if (item.category === 'house') {
        nurturing.equipHouse(item.id);
        showBubble('joy', 1);
      }
    } else {
      // Purchase if not owned
      if (nurturing.gro >= item.price) {
        const success = nurturing.purchaseItem(item.id, item.price);
        if (success) {
          playCleaningSound();
          showBubble('joy', 2);
          // Auto-equip after purchase
          if (item.category === 'ground') {
            nurturing.equipLand(item.id);
          } else if (item.category === 'house') {
            nurturing.equipHouse(item.id);
          }
        }
      } else {
        showBubble('worried', 2); // Not enough money
      }
    }
  };

  const filteredFoods = FOOD_ITEMS.filter(food => food.category === selectedFoodCategory);
  const filteredShopItems = SHOP_ITEMS.filter(item => item.category === selectedShopCategory);

  const toggleMedicineMenu = () => {
    playButtonSound();
    setShowMedicineMenu(!showMedicineMenu);
  };

  const handleGiveMedicine = (medicine: MedicineItem) => {
    if (nurturing.gro < medicine.price) {
      showBubble('worried', 2); // Not enough money
      return;
    }
    nurturing.spendGro(medicine.price);
    playButtonSound();
    setShowMedicineMenu(false);

    // 약/주사 애니메이션 시작
    const isSyringe = medicine.id === 'syringe';
    setIsSequenceActive(true);
    setFlyingFood({
      icon: medicine.icon,
      key: Date.now(),
      type: isSyringe ? 'syringe' : 'pill'
    });

    if (isSyringe) {
      // 주사 효과음: 클린 효과음 사용
      playCleaningSound();
    } else {
      playEatingSound();
    }

    // 애니메이션 완료 후 실제 약 먹이기 실행
    setTimeout(() => {
      setFlyingFood(null);

      setTimeout(() => {
        onActionChange?.(isSyringe ? 'sick' : 'eating'); // 주사는 아파함, 알약은 먹음

        // 양육 시스템으로 약 먹이기 실행
        const result = nurturing.giveMedicine(medicine);

        if (result.success) {
          setTimeout(() => {
            showBubble('sick', 1); // Show relief
            onActionChange?.('happy'); // 기뻐함

            setTimeout(() => {
              onActionChange?.('idle');
              showBubble('joy', 1);
              setIsSequenceActive(false); // Sequence finished
            }, 2000);
          }, 500); // 먹는 모션 후 반응
        } else {
          // Maybe show a "can't use this now" bubble
          setTimeout(() => {
            onActionChange?.('idle');
            setIsSequenceActive(false);
          }, 1500);
        }
      }, 100);

    }, 1200); // 애니메이션 시간
  };

  const handleClean = (tool: CleaningTool) => {
    // Prevent multiple actions
    if (isCleaning || isShowering || isBrushing || action !== 'idle') return;

    playButtonSound();
    setActiveCleaningToolId(tool.id);
    switch (tool.id) {
      case 'broom':
        if (nurturing.poops.length > 0) {
          setIsCleaning(true);
          // 애니메이션 중간에 청소 실행 (빗자루가 쓸 때)
          setTimeout(() => {
            const poopToClean = nurturing.poops[0];
            if (poopToClean) {
              handlePoopClick(poopToClean.id, 2);
            }
          }, 500);
          setTimeout(() => setIsCleaning(false), 1000);
        }
        break;
      case 'newspaper':
        if (nurturing.bugs.length > 0) {
          setIsCleaning(true);
          // 애니메이션 중간에 청소 실행 (신문지로 때릴 때)
          setTimeout(() => {
            const bugToClean = nurturing.bugs[0];
            if (bugToClean) {
              handleBugClick(bugToClean.id);
            } else {
              // Fallback if no specific bug found (shouldn't happen due to check)
              playCleaningSound();
              nurturing.cleanBug(); // Context implementation handles +1/+3
              showBubble('playful', 1);
            }
          }, 500);
          setTimeout(() => setIsCleaning(false), 1000);
        }
        break;
      case 'shower':
        if (nurturing.gro >= tool.price) {
          nurturing.spendGro(tool.price);
          nurturing.takeShower();
          playCleaningSound();
          showBubble('joy', 2);
          setIsShowering(true);
          setTimeout(() => setIsShowering(false), 3000);
        } else {
          showBubble('worried', 2); // Not enough money
        }
        break;
      case 'robot_cleaner':
        if (nurturing.gro >= tool.price) {
          if (nurturing.poops.length > 0 || nurturing.bugs.length > 0) {
            setIsCleaning(true);
            // nurturing.spendGro(tool.price); // Handled in cleanAll
            setTimeout(() => playCleaningSound(), 100);

            const result = nurturing.cleanAll(tool.price);

            if (result.success) {
              showBubble('joy', 3);
            } else {
              // Should not happen due to outer gro check, but safety
              showBubble('worried', 2);
            }

            setTimeout(() => setIsCleaning(false), 2000);
          } else {
            showBubble('neutral', 1); // Nothing to clean
          }
        } else {
          showBubble('worried', 2); // Not enough money
        }
        break;
      case 'toothbrush':
        if (nurturing.gro >= tool.price) {
          nurturing.spendGro(tool.price);
          nurturing.brushTeeth();
          playCleaningSound();
          showBubble('joy', 2);
          setIsBrushing(true);
          setTimeout(() => setIsBrushing(false), 3000);
        } else {
          showBubble('worried', 2); // Not enough money
        }
        break;
      case 'max_stats':
        if (nurturing.gro >= tool.price) {
          nurturing.spendGro(tool.price);
          nurturing.maxStats();
          playCleaningSound();
          showBubble('joy', 3);
        } else {
          showBubble('worried', 2); // Not enough money
        }
        break;
    }
    setShowCleanMenu(false);
  };

  const toggleCleanMenu = () => {
    playButtonSound();
    setShowCleanMenu(!showCleanMenu);
  };

  const handlePlay = () => {
    playButtonSound();
    navigate('/play');
  };

  const handlePoopClick = (poopId: string, happinessBonus: number = 0) => {
    playCleaningSound(); // 청소 효과음 재생
    nurturing.clickPoop(poopId, happinessBonus);
    showBubble('playful', 1);
  };

  const handleBugClick = (bugId: string) => {
    playCleaningSound(); // 청소 효과음 재생
    nurturing.clickBug(bugId);
    showBubble('playful', 1);
  };

  const handleCharacterClick = () => {
    // 젤로 클릭 사운드 재생 (랜덤)
    playJelloClickSound();

    // 캐릭터의 성격 가져오기
    const species = CHARACTER_SPECIES[speciesId];
    const personality = species.personality;

    // 현재 상태값
    const { happiness, health, fullness } = nurturing.stats;

    // 성격과 상태값에 따른 행복도 변화 계산
    const happinessChange = calculateClickResponse(personality, happiness, health, fullness);

    // 행복도 변화에 따른 감정 카테고리 결정
    const { category, level } = getClickEmotionCategory(happinessChange);

    // 디버그 로그
    console.log('👆 Character Click:', {
      personality,
      currentHappiness: happiness,
      happinessChange,
      emotion: { category, level },
    });

    // 말풍선 표시
    showBubble(category, level);

    // 스탯 업데이트: 행복도 변화 + 애정도 증가
    onStatsChange({
      happiness: Math.max(0, Math.min(100, happiness + happinessChange)),
      affection: Math.min(100, character.stats.affection + 1),
    });
  };

  /* 
    Legacy component lookup removed.
    Using generic JelloAvatar component.
  */
  // Removed obsolete alias
  // const CharacterComponent = JelloAvatar;

  // Lightning Effect State
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

      updateLightning(); // Initial set
      const interval = setInterval(updateLightning, 8000); // Change position every 8s
      return () => clearInterval(interval);
    }
  }, [nurturing.currentLand]);

  const getDisplayName = () => {
    if (user?.displayName) {
      // Split "Yellow Jello" -> ["Yellow", "Jello"] -> "Jello"
      const speciesSuffix = character.name.includes(' ') ? character.name.split(' ').pop() : 'Jello';
      return `${user.displayName} ${speciesSuffix}`;
    }
    return character.name;
  };

  // Check if any critical action/animation is currently in progress
  const isActionInProgress =
    action !== 'idle' ||
    flyingFood !== null ||
    isShowering ||
    isBrushing ||
    isCleaning ||
    isSequenceActive;

  const handleHouseClick = () => {
    // Prevent ghost clicks
    if (interactionLockRef.current) return;

    playButtonSound();

    // 1. If currently sleeping -> Ask to wake up
    if (nurturing.isSleeping) {
      setConfirmModalType('wake');
      return;
    }

    // 2. If awake -> Ask to sleep
    // Prevent sleep if actions are active
    if (isActionInProgress) return;

    setConfirmModalType('sleep');
  };

  const handleConfirmSleepWake = () => {
    // Lock interaction to prevent ghost clicks hitting the house again
    interactionLockRef.current = true;
    setTimeout(() => {
      interactionLockRef.current = false;
    }, 800);

    if (confirmModalType === 'wake') {
      nurturing.toggleSleep();
      showBubble('neutral', 1); // Waking up reaction
    } else if (confirmModalType === 'sleep') {
      nurturing.toggleSleep();
    }
    setConfirmModalType(null);
  };

  return (
    <div className="pet-room">
      <div className="pet-room-content" ref={petRoomRef} style={{ flex: 1, display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden' }}>
        {/* Loading Overlay */}
        {isLoading && (
          <div className="loading-overlay">
            <div className="loading-spinner-container">
              <div className="loading-spinner">🐾</div>
              <div className="loading-text">Loading...</div>
            </div>
          </div>
        )}

        {/* Top Header with Character Info */}
        <div className="game-header">
          <div className="character-profile" onClick={() => navigate('/profile')} style={{ cursor: 'pointer' }}>
            <div className="profile-avatar">
              {!showGiftBox ? (
                <JelloAvatar
                  character={character}
                  size="small"
                  mood={mood}
                  action="idle"
                />
              ) : (
                <div className="profile-avatar-placeholder" style={{ width: '100%', height: '100%', borderRadius: '50%', background: 'rgba(0,0,0,0.1)' }} />
              )}
            </div>
            <div className="profile-info">
              <div className="profile-name">{!showGiftBox ? getDisplayName() : '-'}</div>
              <div className="profile-stats-row">
                <div className="profile-level">{t('character.profile.level', { level: character.level })}</div>
                <div className="profile-gro">💰 {nurturing.gro}</div>
              </div>
            </div>
          </div>

          <div className="stats-row">
            <div className="stat-badge stat-badge--hunger">
              <span className="stat-icon">🍖</span>
              <span className="stat-value">{Math.round(nurturing.stats.fullness)}</span>
            </div>
            <div className="stat-badge stat-badge--happiness">
              <span className="stat-icon">{getHappinessIcon(nurturing.stats.happiness)}</span>
              <span className="stat-value">{Math.round(nurturing.stats.happiness)}</span>
            </div>
            <div className="stat-badge stat-badge--health">
              <span className="stat-icon">{getHealthIcon(nurturing.stats.health)}</span>
              <span className="stat-value">{Math.round(nurturing.stats.health)}</span>
            </div>
          </div>
        </div>

        {/* FAB Menu Anchor - Positioned exactly below header */}
        <div style={{ position: 'relative', width: '100%', height: 0, zIndex: 20 }}>
          {/* FAB Menu (Floating Action Button) */}
          <div className="fab-menu-container">
            {/* Main FAB Toggle Button (Now First) */}
            <button
              className="shop-btn-floating"
              onClick={() => {
                playButtonSound();
                setIsFabOpen(!isFabOpen);
              }}
              disabled={showGiftBox}
              title={isFabOpen ? t('common.close', 'Close') : t('common.menu', 'Menu')}
            >
              <span className="action-icon" style={{
                transition: 'transform 0.3s ease',
                transform: isFabOpen ? 'rotate(45deg)' : 'rotate(0deg)',
                color: '#8B4513'
              }}>
                ＋
              </span>
            </button>

            {/* Expanded Menu Items (Flowing downwards) */}
            {isFabOpen && (
              <>
                {/* Shop Button */}
                <button
                  className="fab-menu-item"
                  onClick={toggleShopMenu}
                  disabled={isActionInProgress || showGiftBox}
                  title={t('shop.menu.title', 'Shop')}
                >
                  <span className="action-icon">🛖</span>
                </button>

                {/* Camera Button */}
                <button
                  className="fab-menu-item"
                  onClick={handleCameraClick}
                  disabled={isActionInProgress || showGiftBox}
                  title={t('actions.camera', 'Camera')}
                >
                  <span className="action-icon">📷</span>
                </button>

                {/* Premium Purchase Button */}
                {!nurturing.subscription.isPremium && !showGiftBox && (
                  <div className="fab-premium-wrapper">
                    <button
                      className="premium-btn-floating"
                      onClick={() => {
                        playButtonSound();
                        navigate('/profile');
                      }}
                      disabled={isActionInProgress}
                      title={t('profile.upgradePrompt', 'Upgrade to Premium')}
                    >
                      <span className="action-icon">🎁</span>
                      <span className="premium-label">Premium</span>
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>



        {/* Main Room Area */}
        <div className="room-container">
          {/* Jello House (Bottom Left) */}
          {!showGiftBox && (
            <JelloHouse
              type={nurturing.currentHouseId}
              isSleeping={nurturing.isSleeping}
              onClick={handleHouseClick}
              style={{
                left: '10%',
                bottom: '25%'
              }}
            />
          )}




          {/* 가출 경고 메시지 (죽음 상태가 아닐 때만 표시) */}
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
                {t('game.reset', 'Reset Game')}
              </button>
            </div>
          )}
          <RoomBackground
            background={nurturing.currentLand}
            showGiftBox={showGiftBox}
            lightningStyle={lightningStyle}
          />

          {/* 똥들 렌더링 */}
          {!showGiftBox && nurturing.poops.map((poop) => (
            <Poop key={poop.id} poop={poop} onClick={() => handlePoopClick(poop.id)} />
          ))}

          {/* 벌레들 렌더링 */}
          {!showGiftBox && nurturing.bugs.map((bug) => (
            <Bug key={bug.id} bug={bug} onClick={handleBugClick} />
          ))}

          {/* 샤워 이펙트 (Removed from here) */}

          {/* 먹는 음식 애니메이션 */}
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

          {/* Character (죽음 상태가 아닐 때만 표시) */}
          {nurturing.abandonmentStatus.level !== 'abandoned' && !nurturing.isSleeping && (
            <div
              className="character-container"
              style={{
                left: showGiftBox ? '50%' : `${position.x}%`,
                bottom: showGiftBox ? '50%' : `${position.y}%`,
                transform: 'translate(-50%, 50%)',
              }}
              onClick={handleCharacterClick}
            >
              {bubble && (
                <EmotionBubble
                  key={bubble.key}
                  category={bubble.category}
                  level={bubble.level}
                />
              )}
              {/* 질병 상태 표시 (반창고 - 크로스 X 형태) */}
              {nurturing.isSick && !showGiftBox && (
                <div className="sick-bandaid">
                  <span className="bandaid-cross bandaid-left">🩹</span>
                  <span className="bandaid-cross bandaid-right">🩹</span>
                </div>
              )}
              {/* 질병 상태 표시 (온도계 - 우측 상단) */}
              {nurturing.isSick && !showGiftBox && (
                <div className="sick-thermometer">🌡️</div>
              )}
              {/* 샤워 이펙트 */}
              {isShowering && <div className="shower-effect">🚿</div>}

              {/* 청소 이펙트 */}
              {isCleaning && activeCleaningToolId === 'broom' && <div className="cleaning-effect">🧹</div>}
              {isCleaning && activeCleaningToolId === 'newspaper' && <div className="cleaning-effect">🗞️</div>}
              {isCleaning && activeCleaningToolId === 'robot_cleaner' && <div className="cleaning-effect">🖲️</div>}
              {isCleaning && activeCleaningToolId === 'max_stats' && <div className="cleaning-effect">🌟</div>}

              {/* 양치 이펙트 */}
              {isBrushing && <div className="brushing-effect">🪥</div>}
              {/* 버블 이펙트 */}
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
                  <GiftBox onOpen={handleGiftBoxClick} />
                </div>
              ) : (
                <div style={{ pointerEvents: 'auto' }}>
                  <JelloAvatar
                    character={character}
                    size="small"
                    mood={mood}
                    action={action}
                  />
                </div>
              )}
            </div>
          )}
        </div>
      </div>







      {/* Food Menu Submenu */}
      {showFoodMenu && (
        <MenuModal
          title={t('food.menu.title')}
          onClose={() => setShowFoodMenu(false)}
          headerContent={
            <div className="food-categories">
              {(Object.keys(FOOD_CATEGORIES) as FoodCategory[]).map((category) => (
                <button
                  key={category}
                  className={`category-tab ${selectedFoodCategory === category ? 'active' : ''}`}
                  onClick={() => { playButtonSound(); setSelectedFoodCategory(category); }}
                >
                  <span className="category-icon">{FOOD_CATEGORIES[category].icon}</span>
                  <span className="category-name">{t(FOOD_CATEGORIES[category].nameKey)}</span>
                </button>
              ))}
            </div>
          }
        >
          {filteredFoods.map((food) => (
            <button
              key={food.id}
              className="food-item"
              onClick={() => handleFeed(food)}
              disabled={action !== 'idle' || flyingFood !== null || nurturing.gro < food.price}
            >
              <span className="food-item-icon">{food.icon}</span>
              <span className="food-item-name">{t(food.nameKey)}</span>
              <div className="food-item-effects">
                <span className="food-item-price">💰 {food.price}</span>
                {/*
                    {food.effects.hunger < 0 && (
                      <span className="effect">🍖 {-food.effects.hunger}</span>
                    )}
                    {food.effects.happiness > 0 && (
                      <span className="effect">❤️ +{food.effects.happiness}</span>
                    )}
                    {food.effects.health && food.effects.health > 0 && (
                      <span className="effect">💚 +{food.effects.health}</span>
                    )}
                    */}
              </div>
            </button>
          ))}
        </MenuModal>
      )}

      {/* Medicine Menu Submenu */}
      {showMedicineMenu && (
        <MenuModal
          title={t('medicine.menu.title')}
          onClose={() => setShowMedicineMenu(false)}
        >
          {MEDICINE_ITEMS.map((medicine) => (
            <button
              key={medicine.id}
              className="food-item"
              onClick={() => handleGiveMedicine(medicine)}
              disabled={action !== 'idle' || flyingFood !== null || nurturing.gro < medicine.price || nurturing.stats.health >= 60}
            >
              <span className="food-item-icon">{medicine.icon}</span>
              <span className="food-item-name">{t(medicine.nameKey)}</span>
              <div className="food-item-effects">
                <span className="food-item-price">💰 {medicine.price}</span>
              </div>
            </button>
          ))}
        </MenuModal>
      )}

      {/* Clean Menu Submenu */}
      {showCleanMenu && (
        <MenuModal
          title={t('cleanMenu.title')}
          onClose={() => setShowCleanMenu(false)}
        >
          {CLEANING_TOOLS.map((tool) => (
            <button
              key={tool.id}
              className="food-item"
              onClick={() => handleClean(tool)}
              disabled={
                action !== 'idle' ||
                (tool.id === 'broom' && nurturing.poops.length === 0) ||
                (tool.id === 'newspaper' && nurturing.bugs.length === 0) ||
                (tool.id === 'shower' && nurturing.gro < tool.price) ||
                (tool.id === 'robot_cleaner' && (nurturing.gro < tool.price || (nurturing.poops.length === 0 && nurturing.bugs.length === 0)))
              }
            >
              <span className="food-item-icon">{tool.icon}</span>
              <span className="food-item-name">{t(tool.nameKey)}</span>
              <div className="food-item-effects">
                <span className="effect">{t(tool.descriptionKey)}</span>
              </div>
              <div className="food-item-price">
                {tool.price > 0 ? `💰 ${tool.price}` : 'Free'}
              </div>
            </button>
          ))}
        </MenuModal>
      )}

      {/* Shop Menu Submenu */}
      {showShopMenu && (
        <MenuModal
          title={t('shop.menu.title', 'Shop')}
          onClose={() => setShowShopMenu(false)}
          headerContent={
            <div className="food-categories">
              {(Object.keys(SHOP_CATEGORIES) as ShopCategory[]).map((category) => (
                <button
                  key={category}
                  className={`category-tab ${selectedShopCategory === category ? 'active' : ''}`}
                  onClick={() => { playButtonSound(); setSelectedShopCategory(category); }}
                >
                  <span className="category-icon">{SHOP_CATEGORIES[category].icon}</span>
                  <span className="category-name">{t(SHOP_CATEGORIES[category].nameKey)}</span>
                </button>
              ))}
            </div>
          }
        >
          {filteredShopItems.map((item) => (
            <button
              key={item.id}
              className={`food-item ${(item.category === 'ground' && nurturing.currentLand === item.id) ||
                (item.category === 'house' && nurturing.currentHouseId === item.id)
                ? 'active-item' : ''
                }`}
              onClick={() => handleShopItemClick(item)}
              style={
                (item.category === 'ground' && nurturing.currentLand === item.id) ||
                  (item.category === 'house' && nurturing.currentHouseId === item.id)
                  ? { borderColor: '#FFD700', backgroundColor: '#FFF9E6' } : {}
              }
            >
              <span className="food-item-icon">
                {item.id === 'shape_ground' ? (
                  <span className="custom-icon-shape-ground" />
                ) : (
                  item.icon
                )}
              </span>
              <span className="food-item-name">{t(item.nameKey)}</span>
              <div className="food-item-effects">
                {nurturing.inventory.includes(item.id) || (item.category === 'house' && item.id === 'tent') ? (
                  (item.category === 'ground' && nurturing.currentLand === item.id) ||
                    (item.category === 'house' && nurturing.currentHouseId === item.id) ? (
                    <span className="food-item-price">✅ Owned</span>
                  ) : (
                    <span className="food-item-price">Owned</span>
                  )
                ) : (
                  <span className="food-item-price">💰 {item.price}</span>
                )}
              </div>
            </button>
          ))}
        </MenuModal>
      )}

      {/* Settings Menu */}
      <SettingsMenu
        isOpen={showSettingsMenu}
        onClose={() => setShowSettingsMenu(false)}
      />

      {/* Bottom Action Bar - Visible but disabled when in GiftBox mode */}
      <div className="action-bar">
        <button
          className="action-btn action-btn--small"
          onClick={toggleFoodMenu}
          disabled={isActionInProgress || showGiftBox || nurturing.isSleeping}
          title={t('actions.feed')}
        >
          <span className="action-icon">🍖</span>
        </button>

        <button
          className="action-btn action-btn--small"
          onClick={toggleMedicineMenu}
          disabled={isActionInProgress || showGiftBox || nurturing.isSleeping}
          title={t('actions.medicine')}
        >
          <span className="action-icon">💊</span>
        </button>

        <button
          className="action-btn action-btn--main"
          onClick={handlePlay}
          disabled={isActionInProgress || showGiftBox || nurturing.isSleeping}
        >
          <span className="action-icon-large">🎾</span>
          <span className="action-label">{t('actions.play')}</span>
        </button>

        <button
          className="action-btn action-btn--small"
          onClick={toggleCleanMenu}
          disabled={isActionInProgress || showGiftBox || nurturing.isSleeping}
          title={t('actions.clean')}
        >
          <span className="action-icon">✨</span>
        </button>

        <button
          className="action-btn action-btn--small"
          onClick={() => {
            playButtonSound();
            setShowSettingsMenu(true);
          }}
          disabled={action !== 'idle' || showGiftBox}
          title={t('actions.settings')}
        >
          <span className="action-icon">⚙️</span>
        </button>
      </div>
      {showNicknameModal && (
        <GiftBoxModal onComplete={handleNicknameComplete} />
      )}

      {/* Camera Preview Modal */}
      {showCameraModal && (
        <CameraModal
          imageDataUrl={capturedImage}
          shareUrl={currentShareUrl}
          onClose={() => setShowCameraModal(false)}
        />
      )}

      {/* Sleep/Wake Confirmation Modal */}
      {confirmModalType && (
        <ConfirmModal
          title={confirmModalType === 'sleep' ? t('sleep.confirm.sleepTitle') : t('sleep.confirm.wakeTitle')}
          message={
            confirmModalType === 'sleep'
              ? t('sleep.confirm.sleepMessage')
              : t('sleep.confirm.wakeMessage')
          }
          confirmLabel={t('common.yes')}
          cancelLabel={t('common.no')}
          onConfirm={handleConfirmSleepWake}
          onCancel={() => setConfirmModalType(null)}
        />
      )}
    </div >
  );
};

export default PetRoom;
