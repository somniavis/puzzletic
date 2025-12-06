import React, { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import type { Character, CharacterMood, CharacterAction } from '../../types/character';
import { CHARACTERS } from '../characters';
import { FOOD_ITEMS, FOOD_CATEGORIES, type FoodItem, type FoodCategory } from '../../types/food';
import { MEDICINE_ITEMS, type MedicineItem } from '../../types/medicine';
import { CLEANING_TOOLS, type CleaningTool } from '../../types/cleaning';
import type { CharacterSpeciesId } from '../../data/species';
import { CHARACTER_SPECIES } from '../../data/species';
import { SHOP_ITEMS, SHOP_CATEGORIES, type ShopItem, type ShopCategory } from '../../types/shop';
import { EmotionBubble } from '../EmotionBubble/EmotionBubble';
import type { EmotionCategory } from '../../types/emotion';
import { useNurturing } from '../../contexts/NurturingContext';
import { Poop } from '../Poop/Poop';
import { Bug } from '../Bug/Bug';
import { SettingsMenu } from '../SettingsMenu/SettingsMenu';
import { GiftBox } from '../GiftBox/GiftBox';
import { calculateClickResponse, getClickEmotionCategory } from '../../constants/personality';
import { playButtonSound, playJelloClickSound, playEatingSound, playCleaningSound } from '../../utils/sound';
import { RoomBackground } from './RoomBackground';
import { MenuModal } from './MenuModal';
import './PetRoom.css';

interface PetRoomProps {
  character: Character;
  speciesId: CharacterSpeciesId;
  onStatsChange: (stats: Partial<Character['stats']>) => void;
  onNavigate?: (page: 'gallery' | 'stats' | 'play') => void;
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
  onStatsChange,
  onNavigate,
  showGiftBox = false,
  onOpenGift,
  mood = 'neutral',
  action = 'idle',
  onActionChange
}) => {
  const { t } = useTranslation();

  // 양육 시스템 사용
  const nurturing = useNurturing();

  // Resume tick when entering Pet Room (safety check)
  // Resume tick when entering Pet Room (safety check)
  useEffect(() => {
    if (!showGiftBox) {
      nurturing.resumeTick();
    }
  }, [nurturing.resumeTick, showGiftBox]);

  const [position, setPosition] = useState({ x: 50, y: 50 }); // percentage position
  const [isMoving, setIsMoving] = useState(false);
  const [showFoodMenu, setShowFoodMenu] = useState(false);
  const [showCleanMenu, setShowCleanMenu] = useState(false);
  const [showMedicineMenu, setShowMedicineMenu] = useState(false);
  const [showShopMenu, setShowShopMenu] = useState(false);
  const [showSettingsMenu, setShowSettingsMenu] = useState(false);
  const [selectedFoodCategory, setSelectedFoodCategory] = useState<FoodCategory>('fruit');
  const [selectedShopCategory, setSelectedShopCategory] = useState<ShopCategory>('ground');
  const [currentBackground, setCurrentBackground] = useState<string>('default_ground');
  const [bubble, setBubble] = useState<{ category: EmotionCategory; level: 1 | 2 | 3; key: number } | null>(null);
  const [lastBubbleTime, setLastBubbleTime] = useState(0);
  const [flyingFood, setFlyingFood] = useState<{ icon: string; key: number; type: 'food' | 'pill' | 'syringe' } | null>(null);
  const [isShowering, setIsShowering] = useState(false);
  const [isBrushing, setIsBrushing] = useState(false);
  const [isCleaning, setIsCleaning] = useState(false);
  const [activeCleaningToolId, setActiveCleaningToolId] = useState<string | null>(null);

  const showBubble = (category: EmotionCategory, level: 1 | 2 | 3) => {
    setBubble({ category, level, key: Date.now() });
    setLastBubbleTime(Date.now());
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

      const newX = 20 + Math.random() * 60; // 20% ~ 80%
      const newY = 40 + Math.random() * 40; // 40% ~ 80% (바닥 영역)

      setIsMoving(true);
      setPosition({ x: newX, y: newY });

      setTimeout(() => {
        setIsMoving(false);
      }, 1000); // 이동 시간
    };

    const interval = setInterval(moveRandomly, 3000);
    return () => clearInterval(interval);
  }, [isMoving, action, isShowering, showGiftBox]);

  // 상태 변화에 따른 무드/액션 업데이트
  // Periodic emotion bubble system - shows bubbles based on current state
  useEffect(() => {
    const checkAndShowBubble = () => {
      const now = Date.now();
      const timeSinceLastBubble = now - lastBubbleTime;

      // Don't show bubble if one was shown recently (less than 8 seconds ago)
      if (timeSinceLastBubble < 8000) {
        return;
      }

      // Don't show bubble if currently showing one
      if (bubble !== null) {
        return;
      }

      const { happiness, health, fullness } = nurturing.stats;
      const { condition } = nurturing;

      // Debug log - 상태 확인용 (개발 중)
      console.log('🎈 Bubble Check:', {
        happiness,
        health,
        fullness,
        condition
      });

      // ==================== 위급 상태 (Critical) ====================

      // 1. 매우 위급: 건강 20 미만 (즉시 치료 필요)
      if (health < 20) {
        console.log('→ Showing: Critical Health');
        showBubble('sick', 3);
        return;
      }

      // 2. 위급: 아픔 상태 + 건강 50 미만
      if (condition.isSick && health < 50) {
        console.log('→ Showing: Very Sick');
        showBubble('sick', 2);
        return;
      }

      // 3. 매우 배고픔: 포만감 10 미만 (즉시 먹이 필요)
      if (fullness < 10) {
        console.log('→ Showing: Critical Hunger');
        showBubble('worried', 3);
        return;
      }

      // 4. 배고픔: 배고픔 상태 + 포만감 30 미만
      if (condition.isHungry && fullness < 30) {
        console.log('→ Showing: Very Hungry');
        showBubble('worried', 2);
        return;
      }

      // 5. 똥이 많을 때 (3개 이상)
      if (nurturing.poops.length >= 3) {
        console.log('→ Showing: Too Much Poop');
        showBubble('worried', 3);
        return;
      }

      // 6. 똥이 있을 때 (1-2개)
      if (nurturing.poops.length > 0) {
        console.log('→ Showing: Needs Cleaning');
        showBubble('worried', 1);
        return;
      }

      // ==================== 불만족 상태 (Unhappy) ====================

      // 7. 매우 불행: 행복도 20 미만
      if (happiness < 20) {
        console.log('→ Showing: Very Unhappy');
        showBubble('worried', 3);
        return;
      }

      // 8. 약간 불행: 행복도 40 미만
      if (happiness < 40) {
        console.log('→ Showing: Unhappy');
        showBubble('worried', 1);
        return;
      }

      // ==================== 주의 상태 (Warning) ====================

      // 9. 약한 질병: 아픔 상태 (건강은 50 이상)
      if (condition.isSick) {
        console.log('→ Showing: Mildly Sick');
        showBubble('sick', 1);
        return;
      }

      // 10. 약간 배고픔: 포만감 50 미만
      if (fullness < 50) {
        console.log('→ Showing: Slightly Hungry');
        showBubble('neutral', 2);
        return;
      }

      // 11. 약간 피곤함: 행복도 60 미만
      if (happiness < 60) {
        console.log('→ Showing: Slightly Tired');
        showBubble('neutral', 1);
        return;
      }

      // ==================== 만족 상태 (Satisfied) ====================

      // 12. 매우 행복: 모든 스탯이 높음
      if (happiness > 85 && fullness > 70 && health > 80) {
        console.log('→ Showing: Very Happy');
        showBubble('joy', 3);
        return;
      }

      // 14. 행복: 주요 스탯이 높음
      if (happiness > 70 && fullness > 60 && health > 60) {
        console.log('→ Showing: Happy');
        showBubble('joy', 2);
        return;
      }

      // 15. 만족: 행복도 60 이상
      if (happiness > 60) {
        console.log('→ Showing: Content');
        showBubble('joy', 1);
        return;
      }

      // ==================== 기본 상태 (Default) ====================

      // 16. 평범한 상태 (아무 조건도 만족하지 않음)
      console.log('→ Showing: Neutral');
      showBubble('neutral', 1);
    };

    // Initial check after 2 seconds
    const initialTimeout = setTimeout(checkAndShowBubble, 2000);

    // Check every 10 seconds for periodic bubbles
    const bubbleInterval = setInterval(checkAndShowBubble, 10000);

    return () => {
      clearTimeout(initialTimeout);
      clearInterval(bubbleInterval);
    };
  }, [nurturing.stats, nurturing.condition, bubble, lastBubbleTime]);

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
    if (nurturing.glo < food.price) {
      showBubble('worried', 2); // Not enough money
      return;
    }
    nurturing.spendGlo(food.price);
    playButtonSound();
    setShowFoodMenu(false);

    // 음식 먹는 애니메이션 시작 + 사운드
    setFlyingFood({ icon: food.icon, key: Date.now(), type: 'food' });
    playEatingSound();

    // 애니메이션 완료 후 실제 먹이기 실행
    setTimeout(() => {
      setFlyingFood(null);
      onActionChange?.('eating');

      // 양육 시스템으로 먹이기 실행
      const result = nurturing.feed(food);

      if (result.success) {
        showBubble('playful', 1);

        // 똥 생성시 알림
        if (result.sideEffects?.poopCreated) {
          setTimeout(() => {
            showBubble('neutral', 1);
          }, 1500);
        }
      }

      setTimeout(() => onActionChange?.('idle'), 1500);
    }, 1200); // 애니메이션 시간
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
        setCurrentBackground(item.id);
        showBubble('joy', 1);
      }
    } else {
      // Purchase if not owned
      if (nurturing.glo >= item.price) {
        const success = nurturing.purchaseItem(item.id, item.price);
        if (success) {
          playCleaningSound();
          showBubble('joy', 2);
          // Auto-equip after purchase
          if (item.category === 'ground') {
            setCurrentBackground(item.id);
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
    if (nurturing.glo < medicine.price) {
      showBubble('worried', 2); // Not enough money
      return;
    }
    nurturing.spendGlo(medicine.price);
    playButtonSound();
    setShowMedicineMenu(false);

    // 약/주사 애니메이션 시작
    const isSyringe = medicine.id === 'syringe';
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
          }, 2000);
        }, 500); // 먹는 모션 후 반응
      } else {
        // Maybe show a "can't use this now" bubble
        setTimeout(() => onActionChange?.('idle'), 1500);
      }
    }, 1200); // 애니메이션 시간
  };

  const handleClean = (tool: CleaningTool) => {
    playCleaningSound();
    setActiveCleaningToolId(tool.id);
    switch (tool.id) {
      case 'broom':
        if (nurturing.poops.length > 0) {
          setIsCleaning(true);
          // 애니메이션 중간에 청소 실행 (빗자루가 쓸 때)
          setTimeout(() => {
            const poopToClean = nurturing.poops[0];
            if (poopToClean) {
              handlePoopClick(poopToClean.id, 3);
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
              nurturing.cleanBug();
              showBubble('playful', 1);
            }
          }, 500);
          setTimeout(() => setIsCleaning(false), 1000);
        }
        break;
      case 'shower':
        if (nurturing.glo >= tool.price) {
          nurturing.spendGlo(tool.price);
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
        if (nurturing.glo >= tool.price) {
          if (nurturing.poops.length > 0 || nurturing.bugs.length > 0) {
            setIsCleaning(true);
            nurturing.spendGlo(tool.price);
            setTimeout(() => playCleaningSound(), 100);
            nurturing.cleanAll();
            showBubble('joy', 3);
            setTimeout(() => setIsCleaning(false), 2000);
          } else {
            showBubble('neutral', 1); // Nothing to clean
          }
        } else {
          showBubble('worried', 2); // Not enough money
        }
        break;
      case 'toothbrush':
        if (nurturing.glo >= tool.price) {
          nurturing.spendGlo(tool.price);
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
        if (nurturing.glo >= tool.price) {
          nurturing.spendGlo(tool.price);
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
    if (onNavigate) {
      onNavigate('play');
    }
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

  const CharacterComponent = CHARACTERS[speciesId as keyof typeof CHARACTERS];

  // Lightning Effect State
  const [lightningStyle, setLightningStyle] = useState<React.CSSProperties>({});

  useEffect(() => {
    if (currentBackground === 'volcanic_ground') {
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
  }, [currentBackground]);

  return (
    <div className="pet-room">
      {/* Top Header with Character Info */}
      <div className="game-header">
        <div className="character-profile">
          <div className="profile-avatar">
            <CharacterComponent
              character={character}
              size="small"
              mood={mood}
              action="idle"
            />
          </div>
          <div className="profile-info">
            <div className="profile-name">{character.name}</div>
            <div className="profile-stats-row">
              <div className="profile-level">{t('character.profile.level', { level: character.level })}</div>
              <div className="profile-glo">💰 {nurturing.glo}</div>
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



      {/* Main Room Area */}
      <div className="room-container">
        {/* Shop Button (Top Right) */}
        <button
          className="shop-btn-floating"
          onClick={toggleShopMenu}
          disabled={action !== 'idle'}
          title={t('shop.menu.title', 'Shop')}
        >
          <span className="action-icon">🛖</span>
        </button>

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
          background={currentBackground}
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
        {nurturing.abandonmentStatus.level !== 'abandoned' && (
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
            {isCleaning && activeCleaningToolId === 'robot_cleaner' && <div className="cleaning-effect">🤖</div>}
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
              <GiftBox onOpen={onOpenGift || (() => { })} />
            ) : (
              <CharacterComponent
                character={character}
                size="small"
                mood={mood}
                action={action}
              />
            )}
          </div>
        )}
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
              disabled={action !== 'idle' || nurturing.glo < food.price}
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
              disabled={action !== 'idle' || nurturing.glo < medicine.price || nurturing.stats.health >= 60}
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
                (tool.id === 'shower' && nurturing.glo < tool.price) ||
                (tool.id === 'robot_cleaner' && (nurturing.glo < tool.price || (nurturing.poops.length === 0 && nurturing.bugs.length === 0)))
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
              className={`food-item ${currentBackground === item.id ? 'active-item' : ''}`}
              onClick={() => handleShopItemClick(item)}
              style={currentBackground === item.id ? { borderColor: '#FFD700', backgroundColor: '#FFF9E6' } : {}}
            >
              <span className="food-item-icon">{item.icon}</span>
              <span className="food-item-name">{t(item.nameKey)}</span>
              <div className="food-item-effects">
                {nurturing.inventory.includes(item.id) ? (
                  currentBackground === item.id ? (
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
        onNavigate={onNavigate}
      />

      {/* Bottom Action Bar */}
      <div className="action-bar">
        <button
          className="action-btn action-btn--small"
          onClick={toggleFoodMenu}
          disabled={action !== 'idle' || !!flyingFood || isShowering || isBrushing || isCleaning}
          title={t('actions.feed')}
        >
          <span className="action-icon">🍖</span>
        </button>
        <button
          className="action-btn action-btn--small"
          onClick={toggleMedicineMenu}
          disabled={action !== 'idle' || !!flyingFood || isShowering || isBrushing || isCleaning}
          title={t('actions.medicine')}
        >
          <span className="action-icon">💊</span>
        </button>
        <button
          className="action-btn action-btn--main"
          onClick={handlePlay}
          disabled={action !== 'idle' || !!flyingFood || isShowering || isBrushing || isCleaning}
        >
          <span className="action-icon-large">🎾</span>
          <span className="action-label">{t('actions.play')}</span>
        </button>
        <button
          className="action-btn action-btn--small"
          onClick={toggleCleanMenu}
          disabled={action !== 'idle' || !!flyingFood || isShowering || isBrushing || isCleaning}
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
          disabled={action !== 'idle' || !!flyingFood || isShowering || isBrushing || isCleaning}
          title={t('actions.settings')}
        >
          <span className="action-icon">⚙️</span>
        </button>

      </div>
    </div >
  );
};

export default PetRoom;
