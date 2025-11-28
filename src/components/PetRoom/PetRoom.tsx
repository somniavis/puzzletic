import React, { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import type { Character, CharacterMood, CharacterAction } from '../../types/character';
import { CHARACTERS } from '../characters';
import { FOOD_ITEMS, FOOD_CATEGORIES, type FoodItem, type FoodCategory } from '../../types/food';
import { MEDICINE_ITEMS, type MedicineItem } from '../../types/medicine';
import { CLEANING_TOOLS, type CleaningTool } from '../../types/cleaning';
import type { CharacterSpeciesId } from '../../data/species';
import { CHARACTER_SPECIES } from '../../data/species';
import { EmotionBubble } from '../EmotionBubble/EmotionBubble';
import type { EmotionCategory } from '../../types/emotion';
import { useNurturing } from '../../contexts/NurturingContext';
import { Poop } from '../Poop/Poop';
import { Bug } from '../Bug/Bug';
import { SettingsMenu } from '../SettingsMenu/SettingsMenu';
import { calculateClickResponse, getClickEmotionCategory } from '../../constants/personality';
import { playButtonSound, playJelloClickSound, playEatingSound, playCleaningSound } from '../../utils/sound';
import './PetRoom.css';

interface PetRoomProps {
  character: Character;
  speciesId: CharacterSpeciesId;
  onStatsChange: (stats: Partial<Character['stats']>) => void;
  onNavigate?: (page: 'gallery' | 'stats') => void;
}

export const PetRoom: React.FC<PetRoomProps> = ({ character, speciesId, onStatsChange, onNavigate }) => {
  const { t } = useTranslation();

  // 양육 시스템 사용
  const nurturing = useNurturing();

  const [mood, setMood] = useState<CharacterMood>('neutral');
  const [action, setAction] = useState<CharacterAction>('idle');
  const [position, setPosition] = useState({ x: 50, y: 50 }); // percentage position
  const [isMoving, setIsMoving] = useState(false);
  const [showFoodMenu, setShowFoodMenu] = useState(false);
  const [showCleanMenu, setShowCleanMenu] = useState(false);
  const [showMedicineMenu, setShowMedicineMenu] = useState(false);
  const [showSettingsMenu, setShowSettingsMenu] = useState(false);
  const [selectedFoodCategory, setSelectedFoodCategory] = useState<FoodCategory>('meal');
  const [bubble, setBubble] = useState<{ category: EmotionCategory; level: 1 | 2 | 3; key: number } | null>(null);
  const [lastBubbleTime, setLastBubbleTime] = useState(0);
  const [flyingFood, setFlyingFood] = useState<{ icon: string; key: number; type: 'food' | 'pill' | 'syringe' } | null>(null);
  const [isShowering, setIsShowering] = useState(false);

  const showBubble = (category: EmotionCategory, level: 1 | 2 | 3) => {
    setBubble({ category, level, key: Date.now() });
    setLastBubbleTime(Date.now());
    setTimeout(() => setBubble(null), 3000); // Hide bubble after 3 seconds
  };

  const bubbles = useMemo(() => {
    if (!isShowering) return [];
    return Array.from({ length: 20 }).map((_, i) => ({
      id: i,
      left: Math.random() * 90 + 5,
      delay: Math.random() * 1,
      duration: 1 + Math.random(),
      scale: 0.8 + Math.random() * 0.7
    }));
  }, [isShowering]);

  // Auto-move character randomly
  useEffect(() => {
    const moveInterval = setInterval(() => {
      if (!isMoving && Math.random() > 0.7) {
        const newX = Math.max(10, Math.min(90, position.x + (Math.random() - 0.5) * 30));
        const newY = Math.max(20, Math.min(80, position.y + (Math.random() - 0.5) * 20));
        setPosition({ x: newX, y: newY });
        setIsMoving(true);
        setTimeout(() => setIsMoving(false), 1000);
      }
    }, 3000);

    return () => clearInterval(moveInterval);
  }, [position, isMoving]);

  // Update mood based on nurturing stats
  useEffect(() => {
    const { happiness, health, fullness } = nurturing.stats;
    const { condition } = nurturing;
    let newMood: CharacterMood = 'neutral';

    // Determine mood based on stats
    if (condition.isSick) {
      newMood = 'sick';
    } else if (condition.isHungry) {
      newMood = 'sad';
    } else if (happiness > 85 && fullness > 70 && health > 80) {
      newMood = 'excited';
    } else if (happiness > 70 && fullness > 50) {
      newMood = 'happy';
    } else {
      newMood = 'neutral';
    }

    setMood(newMood);
  }, [nurturing.stats, nurturing.condition]);

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
      setAction('eating');

      // 양육 시스템으로 먹이기 실행
      const result = nurturing.feed(food.id);

      if (result.success) {
        showBubble('playful', 1);

        // 똥 생성시 알림
        if (result.sideEffects?.poopCreated) {
          setTimeout(() => {
            showBubble('neutral', 1);
          }, 1500);
        }
      }

      setTimeout(() => setAction('idle'), 1500);
    }, 1200); // 애니메이션 시간
  };

  const toggleFoodMenu = () => {
    playButtonSound();
    setShowFoodMenu(!showFoodMenu);
  };

  const filteredFoods = FOOD_ITEMS.filter(food => food.category === selectedFoodCategory);

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
      setAction(isSyringe ? 'sick' : 'eating'); // 주사는 아파함, 알약은 먹음

      // 양육 시스템으로 약 먹이기 실행
      const result = nurturing.giveMedicine(medicine.id);

      if (result.success) {
        setTimeout(() => {
          showBubble('sick', 1); // Show relief
          setAction('happy'); // 기뻐함

          setTimeout(() => {
            setAction('idle');
            showBubble('joy', 1);
          }, 2000);
        }, 500); // 먹는 모션 후 반응
      } else {
        // Maybe show a "can't use this now" bubble
        setTimeout(() => setAction('idle'), 1500);
      }
    }, 1200); // 애니메이션 시간
  };

  const handleClean = (tool: CleaningTool) => {
    playButtonSound();

    switch (tool.id) {
      case 'broom':
        if (nurturing.poops.length > 0) {
          playCleaningSound();
          setAction('jumping');
          const poopToClean = nurturing.poops[0];
          handlePoopClick(poopToClean.id);
          setTimeout(() => setAction('idle'), 500);
        }
        break;
      case 'newspaper':
        if (nurturing.bugs.length > 0) {
          playCleaningSound();
          const result = nurturing.cleanBug();
          if (result.success) {
            showBubble('playful', 1);
          }
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
            nurturing.spendGlo(tool.price);
            nurturing.cleanAll();
            playCleaningSound();
            showBubble('joy', 3);
          } else {
            showBubble('neutral', 1); // Nothing to clean
          }
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
    setAction('playing');

    // 양육 시스템으로 놀이하기 실행
    const result = nurturing.play();

    if (result.success) {
      showBubble('joy', 2);
    }

    setTimeout(() => setAction('idle'), 3000);
  };

  const handlePoopClick = (poopId: string) => {
    playCleaningSound(); // 청소 효과음 재생
    nurturing.clickPoop(poopId);
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
        {/* 가출 경고 메시지 */}
        {nurturing.abandonmentStatus.level !== 'normal' && (
          <div className={`abandonment-alert abandonment-alert--${nurturing.abandonmentStatus.level}`}>
            <span className="abandonment-alert__icon">
              {nurturing.abandonmentStatus.level === 'abandoned' && '💀'}
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
        <div className="room-background">
          <div className="room-floor" />
          <div className="room-wall" />
        </div>

        {/* 똥들 렌더링 */}
        {nurturing.poops.map((poop) => (
          <Poop key={poop.id} poop={poop} onClick={handlePoopClick} />
        ))}

        {/* 벌레들 렌더링 */}
        {nurturing.bugs.map((bug) => (
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
              bottom: `${position.y - (window.innerWidth <= 768 ? 9 : 7)}%`,
            }}
          >
            {flyingFood.icon}
          </div>
        )}

        {/* Character */}
        <div
          className="character-container"
          style={{
            left: `${position.x}%`,
            bottom: `${position.y}%`,
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
          {/* 샤워 이펙트 (Moved here) */}
          {isShowering && <div className="shower-effect">🚿</div>}
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
                    transform: `scale(${b.scale})`
                  }}
                >
                  🫧
                </span>
              ))}
            </div>
          )}
          <CharacterComponent
            character={character}
            size="small"
            mood={mood}
            action={action}
          />
        </div>
      </div>

      {/* Food Menu Submenu */}
      {showFoodMenu && (
        <div className="food-menu-overlay" onClick={() => { playButtonSound(); setShowFoodMenu(false); }}>
          <div className="food-menu" onClick={(e) => e.stopPropagation()}>
            <div className="food-menu-header">
              <h3>{t('food.menu.title')}</h3>
              <button className="close-btn" onClick={() => { playButtonSound(); setShowFoodMenu(false); }}>✕</button>
            </div>

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

            <div className="food-items-grid">
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
            </div>
          </div>
        </div>
      )}

      {/* Medicine Menu Submenu */}
      {showMedicineMenu && (
        <div className="food-menu-overlay" onClick={() => { playButtonSound(); setShowMedicineMenu(false); }}>
          <div className="food-menu" onClick={(e) => e.stopPropagation()}>
            <div className="food-menu-header">
              <h3>{t('medicine.menu.title')}</h3>
              <button className="close-btn" onClick={() => { playButtonSound(); setShowMedicineMenu(false); }}>✕</button>
            </div>

            <div className="food-items-grid">
              {MEDICINE_ITEMS.map((medicine) => (
                <button
                  key={medicine.id}
                  className="food-item"
                  onClick={() => handleGiveMedicine(medicine)}
                  disabled={action !== 'idle' || nurturing.glo < medicine.price}
                >
                  <span className="food-item-icon">{medicine.icon}</span>
                  <span className="food-item-name">{t(medicine.nameKey)}</span>
                  <div className="food-item-effects">
                    <span className="food-item-price">💰 {medicine.price}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Clean Menu Submenu */}
      {showCleanMenu && (
        <div className="food-menu-overlay" onClick={() => { playButtonSound(); setShowCleanMenu(false); }}>
          <div className="food-menu" onClick={(e) => e.stopPropagation()}>
            <div className="food-menu-header">
              <h3>{t('cleanMenu.title')}</h3>
              <button className="close-btn" onClick={() => { playButtonSound(); setShowCleanMenu(false); }}>✕</button>
            </div>

            <div className="food-items-grid">
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
                    (tool.id === 'robot_cleaner' && nurturing.glo < tool.price)
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
            </div>
          </div>
        </div>
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
          disabled={action !== 'idle'}
          title={t('actions.feed')}
        >
          <span className="action-icon">🍖</span>
        </button>
        <button
          className="action-btn action-btn--small"
          onClick={toggleMedicineMenu}
          disabled={action !== 'idle'}
          title={t('actions.medicine')}
        >
          <span className="action-icon">💊</span>
        </button>
        <button
          className="action-btn action-btn--main"
          onClick={handlePlay}
          disabled={action !== 'idle'}
        >
          <span className="action-icon-large">🎾</span>
          <span className="action-label">{t('actions.play')}</span>
        </button>
        <button
          className="action-btn action-btn--small"
          onClick={toggleCleanMenu}
          disabled={action !== 'idle'}
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
          disabled={false}
          title={t('actions.settings')}
        >
          <span className="action-icon">⚙️</span>
        </button>
      </div>
    </div>
  );
};

export default PetRoom;
