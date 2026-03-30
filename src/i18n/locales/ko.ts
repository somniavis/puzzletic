// Global Korean Locales
import fishingCountKo from '../../games/math/adventure/level1/FishingCount/locales/ko';
import tenFrameNumberLocale from '../../games/math/adventure/level1/TenFrameNumber/locales/ko';
import tenFrameAddLocale from '../../games/math/adventure/level1/TenFrameAdd/locales/ko';
import moleWhackLocale from '../../games/math/adventure/level1/MoleWhack/locales/ko';
import roundCountingKo from '../../games/math/adventure/level1/RoundCounting/locales/ko';
import numberHiveKo from '../../games/math/adventure/level1/NumberHive/locales/ko';
import fruitSliceKo from '../../games/math/adventure/level1/FruitSlice/locales/ko';
import numberBalanceKo from '../../games/math/adventure/level1/NumberBalance/locales/ko';
import mathArcheryKo from '../../games/math/adventure/level1/MathArchery/locales/ko';
import jelloFeedingKo from '../../games/math/adventure/level1/JelloFeeding/locales/ko';
import frontAdditionKo from '../../games/math/genius/FrontAddition/locales/ko';
import frontSubtractionKo from '../../games/math/genius/FrontSubtraction/locales/ko';
import backMultiplicationKo from '../../games/math/genius/BackMultiplication/locales/ko';
import tenFrameCountKo from '../../games/math/adventure/level2/TenFrameCount/locales/ko';
import mathPinwheelKo from '../../games/math/adventure/level2/PinwheelPop/locales/ko';
import compareCrittersKo from '../../games/math/adventure/level1/CompareCritters/locales/ko';
import deepSeaDiveKo from '../../games/math/adventure/level2/DeepSeaDive/locales/ko';
import ufoInvasionKo from '../../games/math/adventure/level2/UFOInvasion/locales/ko';
import lockOpeningLocale from '../../games/math/adventure/level2/LockOpening/locales/ko';
import magicPotionLocale from '../../games/math/adventure/level2/MagicPotion/locales/ko';

import cargoTrainKo from '../../games/math/adventure/level2/CargoTrain/locales/ko.ts';
import rocketLauncherKo from '../../games/math/adventure/level2/RocketLauncher/locales/ko';
import shapeSumLinkKo from '../../games/math/adventure/level2/ShapeSumLink/locales/ko';
import fruitBoxKo from '../../games/math/adventure/level3/FruitBox/locales/ko';
import iceStackingKo from '../../games/math/adventure/level3/IceStacking/locales/ko';
import floorTilerKo from '../../games/math/adventure/level3/FloorTiler/locales/ko';
import frogJumpKo from '../../games/math/adventure/level3/FrogJump/locales/ko';
import chipCashierKo from '../../games/math/adventure/level3/ChipCashier/locales/ko';
import cellCloneKo from '../../games/math/adventure/level3/CellClone/locales/ko';
import fairShareLocale from "../../games/math/adventure/level3/FairShare/locales/ko";
import donutShopLocale from "../../games/math/adventure/level3/DonutShop/locales/ko";
import chocolateSplitLocale from "../../games/math/adventure/level3/ChocolateSplit/locales/ko";
import scorpionKingLocale from "../../games/math/adventure/level3/ScorpionKing/locales/ko";
import pizzaPizzaLocale from "../../games/math/adventure/level3/PizzaPizza/locales/ko";
import riverCrossingLocale from "../../games/math/adventure/level3/RiverCrossing/locales/ko";
import neonMatrixKo from '../../games/math/adventure/level3/NeonMatrix/locales/ko';
import threeLeafCloverLocale from '../../games/math/adventure/level3/ThreeLeafClover/locales/ko';
import hexHiveSixLocale from '../../games/math/adventure/level3/HexHiveSix/locales/ko';
import flightCalendarLocale from '../../games/math/adventure/level3/FlightCalendar/locales/ko';
import tenFramePopLocale from '../../games/math/adventure/level3/TenFramePop/locales/ko';
import beginnerWizardKo from '../../games/math/adventure/level3/BeginnerWizard/locales/ko';
import constellationFinderKo from '../../games/math/adventure/level3/ConstellationFinder/locales/ko';
import trollAttackKo from '../../games/math/adventure/level3/TrollAttack/locales/ko';
import blockTowerKo from '../../games/brain/level2/BlockTower/locales/ko';
import sharpshooterKo from '../../games/brain/level2/Sharpshooter/locales/ko';

import colorLinkKo from '../../games/brain/level1/ColorLink/locales/ko.ts';
import pairUpTwinKo from '../../games/brain/level1/PairUpTwin/locales/ko.ts';
import mazeEscapeKo from '../../games/brain/level1/MazeEscape/locales/ko.ts';
import wildLinkKo from '../../games/brain/level2/WildLink/locales/ko.ts';
import pairUpConnectKo from '../../games/brain/level2/PairUpConnect/locales/ko.ts';
import animalBanquetKo from '../../games/brain/level2/AnimalBanquet/locales/ko';
import signalHunterKo from '../../games/brain/level2/SignalHunter/locales/ko';
import mazeHunterKo from '../../games/brain/level2/MazeHunter/locales/ko';
import ticTacToeKo from '../../games/brain/level3/TicTacToe/locales/ko';
import omokKo from '../../games/brain/level3/Omok/locales/ko';



const koBase = {
    profile: {
        title: '마이 젤로',
        home: '홈으로',
        signedInAs: '로그인 계정',
        guestUser: '게스트 유저',
        status: {
            premium: '👑 프리미엄',
            angelPass: 'Angel Pass',
            jelloPass: 'Jello Pass',
            free: '체험판',
            premiumLabel: '✨ 프리미엄 멤버',
            freeLabel: '🌱 무료 플랜',
        },
        cancelSubscription: '구독 취소',
        cancelConfirmTitle: '구독을 취소하시겠습니까?',
        cancelConfirmMessage: '취소하면 즉시 무료 플랜으로 전환되며,\n프리미엄 혜택(XP 3배 등)을 잃게 됩니다.',
        cancelSuccess: '구독이 취소되었습니다.',
        upgradePrompt: '업그레이드',
        premiumTitle: '엔젤 패스와 함께 성장해요',
        premiumSubtitle: '우리 아이에겐 더 큰 성장,\n도움이 필요한 아이에겐 더 큰 희망.',
        impactCard: {
            label: '글로벌 임팩트',
            title: '2,450명의 천사들이 함께하고 있어요',
        },
        subscription: {
            quarterly: {
                subscriptionTitle: '분기 젤로 패스',
                subscriptionDesc: '$3.99, 분기 결제',
                durationTitle: '3개월 젤로 패스',
                durationDesc: '$3.99',
            },
            yearly: {
                subscriptionTitle: '연간 엔젤 패스',
                subscriptionDesc: '$12.00, 연간 결제',
                durationTitle: '12개월 엔젤 패스',
                durationDesc: '$12.00',
                badge: '최고의 선택',
            },
            unit: '/ 월',
            currency: 'USD',
        },
        cancelPolicy: '모든 플랜은 언제든 해지 가능합니다.',
        premiumActive: {
            title: '프리미엄 회원입니다!',
            desc: '후원해주셔서 감사합니다.',
        },
        myJelloBox: '마이 젤로 박스',
        collectionLabel: '컬렉션',
        profileInfo: '계정',
        paymentInfo: '결제',
        purchaseButton: '구매',
        expiresLabel: '만료일',
        purchaseConfirm: {
            threeMonths: '3개월 상품을 구매할까요?',
            twelveMonths: '1년 상품을 구매할까요?',
        },
        purchaseResult: {
            success: '구매가 완료되었습니다! (Mock)',
            failure: '구매에 실패했습니다. 콘솔을 확인해 주세요.',
        },
        cancelAnytimeShort: '언제나 구독 해지 가능',
        oneTimePurchaseNote: '반복 결제 없음',
        badges: {
            recommended: '추천',
            subscription: '구독',
            mostPopular: '인기',
        },
        tabs: {
            myJello: '마이 젤로',
            pass: '엔젤 패스',
        },
        parentGate: {
            title: '엔젤 패스',
            instruction: '아래에 표시된 숫자를 입력해 주세요.',
            error: '숫자가 맞지 않아요. 다시 시도해 주세요.',
            clear: '지우기',
            reset: '새 숫자',
            displayLabel: '입력 숫자',
            numberWords: {
                1: '하나',
                2: '둘',
                3: '셋',
                4: '넷',
                5: '다섯',
                6: '여섯',
                7: '일곱',
                8: '여덟',
                9: '아홉',
            },
        },
    },
    landing: {
        title: '나만의 젤로 키우기',
        subtitle: '귀여운 친구와 함께 성장하세요',
        start_experience: '지금 바로 시작하기 (체험)',
        auth_prompt: '이미 계정이 있으신가요?',
        login: '로그인',
        signup: '회원가입',
        back_to_home: '돌아가기 (체험)',
        continue_experience: '이어하기',
        new_game: '새로 시작하기',
        auth: {
            duplicateLoginAlert: '다른 기기에서 로그인하여 접속을 종료합니다.',
        },
    },

    character: {
        profile: {
            level: 'Lv.{{level}}',
        },
        stats: {
            hunger: '포만감',
            happiness: '행복도',
            health: '건강',
            hygiene: '청결',
            fatigue: '피로',
            affection: '애정도',
        },
        tags: {
            defense: '방어',
            honey_wood: '꿀/나무',
            attack: '공격력',
            fire_flame: '불/화염',
            magic: '마법',
            poison_curse: '독/저주',
            sleep: '수면',
            illusion_cottoncandy: '환상/솜사탕',
            hp: '체력',
            vitality_buff: '활력/버프',
            heal: '치유',
            purification_plant: '정화/식물',
            bind: '속박',
            stability_normal: '안정/노말',
            speed: '속도',
            flexibility_water: '유연함/물',
        },
        species: {
            yellowJello: '옐로우 젤로',
            redJello: '레드 젤로',
            limeJello: '라임 젤로',
            mintJello: '민트 젤로',
            blueJello: '블루 젤로',
            creamJello: '크림 젤로',
            pinkJello: '핑크 젤로',
            purpleJello: '퍼플 젤로',
            skyJello: '스카이 젤로',
            brownJello: '브라운 젤로',
            orangeJello: '오렌지 젤로',
            oliveJello: '올리브 젤로',
            cyanJello: '시안 젤로',
        },
        evolutions: {
            // Yellow Jello
            yellowJello_stage1_name: '옐로 젤로',
            yellowJello_stage1_desc: '은은한 단내가 나는 젤리. 숲속의 작은 물방울처럼 생겼습니다.',
            yellowJello_stage2_name: '트위글로',
            yellowJello_stage2_desc: '머리에 작은 나뭇가지가 자라났습니다. 가지에서 흐르는 달콤한 수액으로 곤충들을 끌어들입니다.',
            yellowJello_stage3_name: '바인젤',
            yellowJello_stage3_desc: '몸을 질긴 덩굴이 감싸 방어력이 높습니다. 덩굴 사이의 끈적한 꿀로 적을 꼼짝 못 하게 만듭니다.',
            yellowJello_stage4_name: '허니블룸',
            yellowJello_stage4_desc: '몸에 꽃이 피고 팔다리가 생겼습니다. 단짝 꿀벌 친구와 함께 다니며 꿀을 나눠 먹고 체력을 회복합니다.',
            yellowJello_stage5_name: '아르보로스',
            yellowJello_stage5_desc: '거대한 숲의 수호룡입니다. 나뭇잎 날개로 비행하며, 꼬리의 꽃에서 뿜는 \"허니 브레스\"로 적을 잠재웁니다.',

            // Red Jello
            redJello_stage1_name: '레드 젤로',
            redJello_stage1_desc: '만지면 뜨끈한 열기가 느껴지는 젤리. 화가 나면 빨간색이 진해지며 주변이 더워집니다.',
            redJello_stage2_name: '데빌렛',
            redJello_stage2_desc: '머리에 앙증맞은 붉은 뿔이 솟았습니다. 뿔로 찌르는 장난을 좋아하며 화나면 불꽃이 튑니다.',
            redJello_stage3_name: '임프젤',
            redJello_stage3_desc: '박쥐 날개로 날렵하게 날아다닙니다. 짓궂은 장난을 치고 도망가지만 사탕을 주면 온순해집니다.',
            redJello_stage4_name: '파이론',
            redJello_stage4_desc: '꼬리에 꺼지지 않는 불꽃이 타오릅니다. 입에서 불을 뿜을 수 있으며 약한 친구를 앞장서서 지켜줍니다.',
            redJello_stage5_name: '인페르노스',
            redJello_stage5_desc: '마그마가 흐르는 지옥의 군주입니다. 넘치는 파괴력을 제어하기 위해 스스로를 사슬로 묶은 \"맹세\"의 화신입니다.',

            // Mint Jello
            mintJello_stage1_name: '민트 젤로',
            mintJello_stage1_desc: '만지면 시원한 쿨링감이 느껴지는 젤리. 맑은 이슬을 먹고 자라며 상쾌한 허브향을 남깁니다.',
            mintJello_stage2_name: '리플로',
            mintJello_stage2_desc: '머리에 귀여운 새싹이 돋았습니다. 맑은 물과 햇빛을 좋아해 양지바른 곳을 찾아다닙니다.',
            mintJello_stage3_name: '브룸민트',
            mintJello_stage3_desc: '새싹이 자라 예쁜 꽃을 피웠습니다. 잎사귀를 파닥거려 주변 공기를 정화하고 친구들에게 휴식을 줍니다.',
            mintJello_stage4_name: '페어리프',
            mintJello_stage4_desc: '커다란 잎사귀 날개로 숲을 날아다닙니다. 시들어가는 식물 근처에 가면 다시 살려내는 능력이 있습니다.',
            mintJello_stage5_name: '베르단토스',
            mintJello_stage5_desc: '자연의 생명력을 두른 숲의 수호룡입니다. 날갯짓으로 \"치유의 바람\"을 일으켜 넓은 지역을 동시에 회복시킵니다.',

            // Blue Jello
            blueJello_stage1_name: '블루 젤로',
            blueJello_stage1_desc: '깊은 바닷물처럼 투명하고 시원한 젤리. 표정 변화가 거의 없으며 물처럼 유연하게 상황에 대처합니다.',
            blueJello_stage2_name: '핀젤',
            blueJello_stage2_desc: '머리에 날렵한 상어 지느러미가 생겼습니다. 물속에서 매우 빠르며 위기 시 순식간에 도망칩니다.',
            blueJello_stage3_name: '코랄린',
            blueJello_stage3_desc: '몸에 알록달록한 산호초 장식이 생겼습니다. 아가미 호흡이 가능하며 수압을 견딜 만큼 몸이 단단합니다.',
            blueJello_stage4_name: '하이드로',
            blueJello_stage4_desc: '지느러미 날개가 생겨 입에서 \"워터 캐논\"을 발사합니다. 깊은 물 밑바닥에서 명상하는 것을 즐깁니다.',
            blueJello_stage5_name: '오셔노스',
            blueJello_stage5_desc: '바다를 지배하는 수룡입니다. 투명하게 빛나는 비늘을 가졌으며, 화가 나면 거대한 해일을 일으킵니다.',

            // Cream Jello
            creamJello_stage1_name: '크림 젤로',
            creamJello_stage1_desc: '갓 구운 빵 냄새가 나는 포근한 젤리. 성격이 느긋해 햇볕이 드는 곳에서 녹은 듯이 잠듭니다.',
            creamJello_stage2_name: '뮬로',
            creamJello_stage2_desc: '머리에 고양이 귀가 솟았습니다. 청각이 예민해 간식 봉지 소리만 들리면 자다가 벌떡 일어납니다.',
            creamJello_stage3_name: '위스켈',
            creamJello_stage3_desc: '수염과 긴 꼬리가 생겨 완벽한 \"식빵 자세\"가 가능합니다. 좁은 상자를 좋아하며 귀찮게 하면 꼬리로 바닥을 칩니다.',
            creamJello_stage4_name: '키퍼',
            creamJello_stage4_desc: '움직이는 것조차 귀찮아져 제자리에서 \"식빵\" 자세를 유지합니다. 머리 위 생선과 꼬리의 털실은 건드리면 하악질을 할 만큼 아끼는 보물입니다.',
            creamJello_stage5_name: '펠리노스',
            creamJello_stage5_desc: '우아한 묘인(Cat) 드래곤입니다. 날개의 젤리 발바닥 문양은 적을 방심하게 만들며, 강력한 \"냥냥 펀치\"를 날립니다.',

            // Pink Jello
            pinkJello_stage1_name: '핑크 젤로',
            pinkJello_stage1_desc: '딸기향이 나는 분홍색 젤리. 기분이 좋으면 몸이 부풀어 오르며 달콤한 냄새를 풍깁니다.',
            pinkJello_stage2_name: '롤리젤',
            pinkJello_stage2_desc: '머리에 막대사탕 안테나가 생겼습니다. 우울한 친구를 발견하면 안테나를 흔들어 위로해 줍니다.',
            pinkJello_stage3_name: '트윙젤',
            pinkJello_stage3_desc: '몸에 별사탕 장식이 붙어 반짝입니다. 움직일 때마다 맑고 고운 톡톡 튀는 소리가 납니다.',
            pinkJello_stage4_name: '코튼퍼프',
            pinkJello_stage4_desc: '몽글몽글한 솜사탕 구름을 달고 둥실둥실 떠다닙니다. 솜사탕 속에 맛있는 간식을 숨겨 다닙니다.',
            pinkJello_stage5_name: '캔디오스',
            pinkJello_stage5_desc: '솜사탕 날개를 가진 환상의 드래곤입니다. 지나간 자리에 뿌리는 달콤한 가루는 적을 깊고 행복한 잠에 빠뜨립니다.',



            // Authrple Jello
            purpleJello_stage1_name: '퍼플 젤로',
            purpleJello_stage1_desc: '밤이 되면 몸에서 빛이 나는 젤리. 알 수 없는 옹알이로 주문을 외우는 소리를 냅니다.',
            purpleJello_stage2_name: '위스퍼',
            purpleJello_stage2_desc: '꼬리에 도깨비불(Wisp)이 생겼습니다. 이 불빛으로 영혼들과 대화하며 어두운 길을 밝힙니다.',
            purpleJello_stage3_name: '룬임프',
            purpleJello_stage3_desc: '이마에 고대 문자가 새겨진 외뿔이 돋았습니다. 꼬리의 불빛을 미끼로 적을 유인해 혼란스럽게 합니다.',
            purpleJello_stage4_name: '스펠바운드',
            purpleJello_stage4_desc: '마력을 제어하기 위해 온몸을 부적 띠로 감았습니다. 단짝 해골(Skull)이 뒤를 감시해 줍니다.',
            purpleJello_stage5_name: '아카니오스',
            purpleJello_stage5_desc: '봉인이 풀린 고대 마법의 드래곤입니다. 날갯짓만으로 광범위한 저주나 축복을 내리는 저승의 안내자입니다.',

            // Orange Jello
            orangeJello_stage1_name: '오렌지 젤로',
            orangeJello_stage1_desc: '갓 짠 주스처럼 상큼한 향이 나는 젤리. 탄성이 좋아 공처럼 통통 튀어 다니기를 좋아합니다.',
            orangeJello_stage2_name: '만다팝',
            orangeJello_stage2_desc: '머리에 귤 조각 같은 귀가 생겼습니다. 기분이 좋으면 탄산 같은 기포가 올라오며 구르기를 잘합니다.',
            orangeJello_stage3_name: '시트루픽스',
            orangeJello_stage3_desc: '머리에 새싹과 작은 날개가 돋았습니다. 햇빛을 받으면 광합성을 하여 주변에 상큼한 기운을 나눕니다.',
            orangeJello_stage4_name: '비타윙',
            orangeJello_stage4_desc: '꼬리에 영양분이 담긴 \"생명의 귤\"이 열렸습니다. 지친 아군에게 과즙을 나눠주어 활력을 되찾아줍니다.',
            orangeJello_stage5_name: '텐저로스',
            orangeJello_stage5_desc: '강인한 생명력을 가진 과일 드래곤입니다. 입에서 뿜는 \"시트러스 브레스\"는 적의 전의를 상실하게 만들 만큼 상쾌합니다.',

            // Sky Jello
            skyJello_stage1_name: '스카이 젤로',
            skyJello_stage1_desc: '하늘 젤로',

            // Brown Jello
            brownJello_stage1_name: '브라운 젤로',
            brownJello_stage1_desc: '브라운 젤로',

            // Olive Jello
            oliveJello_stage1_name: '올리브 젤로',
            oliveJello_stage1_desc: '올리브 젤로',

            // Cyan Jello
            cyanJello_stage1_name: '시안 젤로',
            cyanJello_stage1_desc: '시안 젤로',
        },
    },
    common: {
        startGame: '게임 시작',
        start: '시작',
        cancel: '취소',
        premium: '프리미엄',
        upgrade_btn_text: '업그레이드',
        modal: {
            title: 'One for you,\none for a friend in need.',
            desc: '<bold>나</bold>의 프리미엄 잠금 해제가,\n<bold>도움이 필요한 친구</bold>에게도 기회를 줍니다.',
            benefit1: '모든 젤로 진화 & 게임 잠금 해제',
            benefit2: '도움이 필요한 아이에게 1년 패스 기부',
            benefit3: 'XP & GRO 부스트로 더 빠르게 성장',
        },
        loading: '로딩 중...',
        confirm: '확인',
        close: '닫기',
        menu: '메뉴',
        score: '점수',
        lives: '생명',
        combo: '콤보',
        bestCombo: '최고 콤보',
        difficulty: '난이도',
        time: '시간',
        accuracy: '정확도',
        stageClear: '스테이지 클리어!',
        gameOver: '게임 오버!',
        finalScore: '최종 점수',
        bestScore: '최고 점수',
        previousBest: '이전 기록',
        newRecord: '신기록 달성!',
        playAgain: '다시 하기',
        download: '결과 저장',
        howToPlay: '게임 방법',
        results: '게임 결과',
        earnedXp: 'XP',
        earnedGro: 'Gro',
        earnedStar: '스타',
        yes: '예',
        no: '아니오',
        confirm_reset: '새 게임을 시작하시겠어요? 기존 데이터는 삭제됩니다.',
        goHome: '홈으로 가기',
        errorBoundary: {
            updateTitle: '새 버전이 배포되었어요!',
            updateDesc: '최신 버전을 불러오려면 이 페이지를 새로고침해 주세요.',
            refreshButton: '새로고침',
            tempErrorTitle: '일시적인 오류가 발생했습니다.',
            tempErrorRetry: '다시 시도',
            globalErrorTitle: '오류가 발생했습니다',
            globalErrorDesc: '앱을 실행하는 도중 문제가 생겼습니다.',
            errorDetailsTitle: '오류 상세 정보',
        },
    },
    evolution: {
        title: '진화!',
        continue: '화면을 터치하세요',
    },
    graduation: {
        title: '안녕, 젤로!',
        message: "젤로가 다 자라서 더 넓은 세상으로 떠났어요! 🌍",
        action: "다음에 또 만나!",
    },
    food: {
        menu: {
            title: '먹이',
            close: '닫기',
        },
        categories: {
            fruit: '과일',
            vegetable: '채소',
            bakery: '베이커리',
            meal: '식사',
            snack: '간식',
            dessert: '디저트',
        },
        items: {
            // Fruits
            grapes: '포도',
            melon: '멜론',
            watermelon: '수박',
            tangerine: '귤',
            lemon: '레몬',
            lime: '라임',
            banana: '바나나',
            pineapple: '파인애플',
            mango: '망고',
            red_apple: '빨간 사과',
            green_apple: '초록 사과',
            pear: '배',
            peach: '복숭아',
            cherries: '체리',
            strawberry: '딸기',
            blueberries: '블루베리',
            kiwi_fruit: '키위',
            tomato: '토마토',
            olive: '올리브',
            coconut: '코코넛',

            // Vegetables
            avocado: '아보카도',
            eggplant: '가지',
            potato: '감자',
            carrot: '당근',
            ear_of_corn: '옥수수',
            hot_pepper: '고추',
            bell_pepper: '피망',
            cucumber: '오이',
            leafy_green: '쌈채소',
            broccoli: '브로콜리',
            garlic: '마늘',
            onion: '양파',
            peanuts: '땅콩',
            beans: '콩',
            chestnut: '밤',
            ginger: '생강',
            pea_pod: '완두콩',
            mushroom: '버섯',

            // Bakery
            bread: '식빵',
            croissant: '크루아상',
            baguette_bread: '바게트',
            flatbread: '플랫브레드',
            pretzel: '프레첼',
            bagel: '베이글',
            pancakes: '팬케이크',
            waffle: '와플',
            butter: '버터',
            cheese_wedge: '치즈',

            // Meals
            meat_on_bone: '고기',
            poultry_leg: '닭다리',
            cut_of_meat: '스테이크',
            bacon: '베이컨',
            hamburger: '햄버거',
            french_fries: '감자튀김',
            pizza: '피자',
            hot_dog: '핫도그',
            sandwich: '샌드위치',
            taco: '타코',
            burrito: '부리토',
            stuffed_flatbread: '케밥',
            falafel: '파라펠',
            egg: '달걀',
            cooking: '요리',
            curry_rice: '카레라이스',
            steaming_bowl: '우동',
            cooked_rice: '밥',
            pot_of_food: '찌개',
            shallow_pan_of_food: '파에야',

            // Snacks
            oden: '오뎅',
            rice_cracker: '쌀과자',
            rice_ball: '주먹밥',
            fried_shrimp: '새우튀김',
            fish_cake_with_swirl: '나루토마끼',
            dumpling: '만두',
            fortune_cookie: '포춘쿠키',
            moon_cake: '월병',
            takeout_box: '배달음식',
            popcorn: '팝콘',
            canned_food: '통조림',
            roasted_sweet_potato: '군고구마',
            tamale: '타말레',

            // Desserts
            soft_ice_cream: '소프트 아이스크림',
            shaved_ice: '빙수',
            ice_cream: '아이스크림',
            doughnut: '도넛',
            cookie: '쿠키',
            birthday_cake: '생일 케이크',
            shortcake: '조각 케이크',
            cupcake: '컵케이크',
            pie: '파이',
            chocolate_bar: '초콜릿',
            candy: '사탕',
            lollipop: '막대사탕',
            custard: '푸딩',
            honey_pot: '꿀단지',
        },
        effects: {
            hunger: '포만감',
            happiness: '행복도',
            health: '건강',
        },
    },
    medicine: {
        menu: {
            title: '치료',
        },
        items: {
            pill: '알약',
            syringe: '예방주사',
        },
    },
    nurturingPanel: {
        stats: {
            fullness: '포만감',
            health: '건강',
            happiness: '행복도',
        },
        alerts: {
            hungry: '🍖 배고파요! 음식을 주세요',
            sick: '💊 아파요! 약이 필요해요',
        },
        interactions: {
            catchBug: '클릭해서 잡기',
            cleanPoop: '클릭해서 치우기',
        },
        studyCount: '학습 {{count}}회',
    },
    shop: {
        menu: {
            title: '상점',
        },
        status: {
            active: '사용 중',
            owned: '보유',
            free: '무료',
        },
        categories: {
            ground: '배경',
            house: '하우스',
            pet: '펫',
        },
        items: {
            default_ground: '포근한 방',
            'default_ground.desc': '따뜻하고 편안한 시작의 방입니다.',
            forest_ground: '숲속 랜드',
            'forest_ground.desc': '상쾌한 공기와 푸른 나무들.',
            tropical_ground: '열대 해변',
            'tropical_ground.desc': '야자수 아래에서 휴식을 취하세요.',
            desert_ground: '사막 랜드',
            'desert_ground.desc': '뜨거운 태양과 모래 언덕.',
            arctic_ground: '얼음 툰드라',
            'arctic_ground.desc': '차가운 얼음과 오로라.',
            volcanic_ground: '화산 랜드',
            'volcanic_ground.desc': '끓어오르는 용암과 화산재.',
            shape_ground: '도형 랜드',
            'shape_ground.desc': '기하학적 신비의 세상.',
            sweet_ground: '캔디 랜드',
            'sweet_ground.desc': '달콤하고 맛있는 꿈의 나라.',
            night_city: '밤의 도시',
            'night_city.desc': '잠들지 않는 화려한 도시.',
            deep_sea_ground: '심해 랜드',
            'deep_sea_ground.desc': '신비로운 깊은 바다 속 세상.',
            amusement_park_ground: '꿈의 놀이공원',
            'amusement_park_ground.desc': '즐거운 놀이기구가 가득한 환상의 나라입니다.',
            layout1_template: '레이아웃 템플릿 1',
            'layout1_template.desc': '새로운 랜드를 만들기 위한 템플릿.',

            // Houses
            tent: '텐트',
            'tent.desc': '아늑한 캠핑 텐트입니다.',
            old_house: '낡은 집',
            house: '일반 주택',
            garden_house: '정원 주택',
            building: '빌딩',
            hotel: '호텔',
            factory: '공장',
            circus: '서커스',
            stadium: '경기장',
            church: '교회',
            mosque: '모스크',
            hindu_temple: '힌두 사원',
            synagogue: '유대교 회당',
            greek_temple: '그리스 신전',
            kaaba: '카바 신전',
            japanese_castle: '일본 성',
            european_castle: '유럽 성',

            // Pet
            'pet.partner': '파트너',
            'pet.timeRemaining': '남은 시간',
            'pet.expired': '만료됨',
            'pet.gacha.title': '랜덤 펫',
            'pet.gacha.desc': '펫이 잠시동안 놀러와요.',
            'pet.gacha.price': '💰 350',

            // Pet Names
            'pet.monkey': '우끼',
            'pet.hedgehog': '따끔이',
            'pet.lizard': '날쌘돌이',
            'pet.octopus': '먹물이',
            'pet.squid': '흐물이',
            'pet.snail': '껍데기',
            'pet.scorpion': '독침이',
            'pet.turtle': '단단이',
            'pet.dodo': '뒤뚱이',
            'pet.snowman': '꽁꽁이',
            'pet.dino': '크앙이',
            'pet.phoenix': '활활이',
            'pet.r2_pet_1': '스페셜 펫',
        },
    },
    rarity: {
        common: '일반',
        uncommon: '고급',
        rare: '희귀',
    },
    actions: {
        feed: '먹이',
        medicine: '치료',
        play: '놀이',
        clean: '청소',
        camera: '카메라',
        settings: '설정',
        evolve: '진화하기',
        graduate: '졸업하기',
        cancel: '취소',
        confirm: '확인',
        close: '닫기',
    },
    camera: {
        title: '스냅샷!',
        save: '저장',
        copyLink: '링크 복사',
        capturing: '촬영 중...',
    },
    share: {
        linkCopied: '링크 복사됨!',
        copyFailed: '복사 실패',
        invite: {
            title: '제가 키우는 젤로예요! 🥰',
            desc: '같이 키워보실래요?',
        },
        cta: '지금 플레이하기',
        error: {
            invalid: '유효하지 않은 링크입니다',
            missing: '데이터를 찾을 수 없습니다',
        },
    },
    sleep: {
        confirm: {
            sleepTitle: '재우기',
            sleepMessage: '젤로를 재우시겠어요? 💤\n(30분 동안 잠을 잡니다)',
            wakeTitle: '깨우기',
            wakeMessage: '젤로를 깨우시겠어요? 🌅',
        },
    },
    cleanMenu: {
        title: '청소 도구',
        broom: {
            name: '빗자루',
            effect: '똥 1개 청소',
        },
        newspaper: {
            name: '신문지',
            effect: '벌레 1마리 잡기',
        },
        shower: {
            name: '샤워기',
            effect: '상쾌하게 씻기',
        },
        robot_cleaner: {
            name: '로봇청소기',
            effect: '모두 청소하기',
        },
        toothbrush: {
            name: '칫솔',
            effect: '깨끗하게 양치',
        },
        max_stats: {
            name: '치트키',
            effect: '모든 상태 회복',
        },
    },
    emotions: {
        joy: {
            l1: {
                affectionate: ['😊 좋아!', '😄 헤헤', '🙌 야호!'],
                playful: ['😆 오예!', '🎶 신난다!', '😁 히히'],
                calm: ['😌 좋네요.', '🎵 음!', '👌 괜찮군요.'],
                shy: ['☺️ (작게 웃음)', '😳 좋아..', '😚 헤..'],
                grumpy: ['😒 흥.', '😏 뭐..', '🙄 나쁘지 않네.'],
                energetic: ['✨ 대박!', '👍 짱이야!', '😲 우와!'],
            },
            l2: {
                affectionate: ['🥰 행복해!', '🌈 신나요!', '🎈 꺄악!'],
                playful: ['🏃 달려!', '⚽️ 더 놀자!', '🦖 크아앙!'],
                calm: ['☕️ 즐겁네요.', '🍀 만족해요.', '🍃 편안해요.'],
                shy: ['😽 고마워..', '🌸 헤헤..', '🙈 쑥스러워..'],
                grumpy: ['😑 괜찮네.', '😼 피식.', '😮 오.'],
                energetic: ['🏆 최고야!', '💪 힘이 넘쳐!', '🚀 달리자!'],
            },
            l3: {
                affectionate: ['❤️ 사랑해!', '💖 너무 좋아!', '🌟 최고야!'],
                playful: ['💡 천재다!!', '👑 내가 짱!', '😂 우하하!'],
                calm: ['🙏 정말 기쁘네요.', '🙇 감사합니다.', '👏 훌륭해요.'],
                shy: ['🍅 (얼굴 빨개짐)', '🎁 너무 고마워..', '🦄 꿈같아..'],
                grumpy: ['🆗 이건 인정.', '💬 ..고마워.', '😤 흠!'],
                energetic: ['🔥 에너지 폭발!', '🌍 세상 최고!', '📢 소리 질러!'],
            },
        },
        love: {
            l1: {
                affectionate: ['😘 쪽!', '🐣 귀여워..', '👋 쓰담쓰담'],
                playful: ['🎣 잡았다!', '💎 내꺼!', '👉 얍!'],
                calm: ['🌤️ 다행이에요.', '👤 좋은 분..', '🛡️ 든든해요.'],
                shy: ['😺 (부비부비)', '🧣 따뜻해..', '😊 헤헤..'],
                grumpy: ['😕 뭐야..', '✋ 비켜.', '😤 흥.'],
                energetic: ['💘 하트 뿅!', '🤜🤛 베프!', '👍 너 최고!'],
            },
            l2: {
                affectionate: ['🤗 안아줘요!', '🌞 따뜻해~', '💋 쪼옥!'],
                playful: ['👐 간지럼 태워!', '🐨 껌딱지!', '🏹 놓치지 않아!'],
                calm: ['💎 소중해요.', '🌲 곁에 있을게요.', '🤝 믿어요.'],
                shy: ['☺️ (수줍)', '💌 좋아해요..', '💓 두근두근..'],
                grumpy: ['😳 ..따뜻하네.', '⏱️ 잠깐만이야.', '😒 흠..'],
                energetic: ['⚡️ 우정 파워!', '🤖 합체!', '♾️ 영원히!'],
            },
            l3: {
                affectionate: ['🏡 평생 함께!', '👫 단짝 친구!', '💝 사랑듬뿍!'],
                playful: ['👮 꼼짝 마!', '🎖️ 절친 인증!', '🫡 대장님!'],
                calm: ['💐 깊이 감사해요.', '🧶 운명이에요.', '✨ 축복을.'],
                shy: ['🫂 (말없이 포옹)', '😻 사랑..해..', '🍀 행복해..'],
                grumpy: ['😎 너.. 봐준다.', '😠 딱히 좋아서는..', '🐕 곁에 있어.'],
                energetic: ['👯 최강 콤비!', '🚀 우주 끝까지!', '🎉 오예!!'],
            },
        },
        playful: {
            l1: {
                affectionate: ['😋 냠냠!', '🍓 맛있다!', '🍭 달콤해'],
                playful: ['🐊 덥썩!', '🍔 와구와구', '😛 메롱!'],
                calm: ['🥄 잘 먹겠습니다.', '🍵 음미 중.', '🥗 맛있네요.'],
                shy: ['🐹 옴뇸뇸..', '🍪 맛나요..', '🐿️ (오물오물)'],
                grumpy: ['😐 먹을만하네.', '🦴 쩝쩝.', '😑 흥.'],
                energetic: ['🍡 한입에 쏙!', '🍚 더 줘!', '🥕 우적우적'],
            },
            l2: {
                affectionate: ['🎡 재밌어!', '🤣 간지러워~', '😆 까르르'],
                playful: ['🔫 받아라!', '⚔️ 공격!', '🛡️ 피해봐!'],
                calm: ['🧐 흥미롭네요.', '🎲 재밌군요.', '😏 후후.'],
                shy: ['🫣 (빼꼼)', '👉👈 저기..', '👻 놀랐죠?'],
                grumpy: ['🛑 귀찮게 하지 마.', '😩 귀찮아.', '👋 저리가.'],
                energetic: ['🐇 점프!', '🌀 구르기!', '💨 슝슝!'],
            },
            l3: {
                affectionate: ['🎪 너무 신나!', '🎈 하늘 날듯!', '😵💫 빙글빙글'],
                playful: ['🎆 팡팡!', '🎺 축제다!', '🦸 무적이다!'],
                calm: ['🥺 감동적이에요.', '😲 놀랍군요.', '👏 박수!'],
                shy: ['🤭 (숨어서 웃음)', '✨ 이런 기분 처음..', '🤩 와아..'],
                grumpy: ['🙀 깜짝이야!', '😼 제법인데?', '👀 오호.'],
                energetic: ['📈 한계를 돌파!', '🚄 멈출 수 없어!', '🏎️ 초고속!'],
            },
        },
        neutral: {
            l1: {
                affectionate: ['🧸 심심해..', '🥺 놀아줘..', '💧 잉잉'],
                playful: ['🤔 뭐 하지?', '😈 장난칠까?', '💬 심심한데..'],
                calm: ['🤫 조용하네요.', '😶 ...', '🕊️ 평화로워요.'],
                shy: ['👀 (눈치)', '😐 ...', '🐜 저기..'],
                grumpy: ['😩 지루해.', '🌬️ 하아..', '😑 노잼.'],
                energetic: ['🤸 몸 쑤셔!', '🚪 나가자!', '💣 심심폭발!'],
            },
            l2: {
                affectionate: ['🔭 보고싶어..', '👣 어디갔어?', '🐕 기다릴게'],
                playful: ['⚡️ 찌릿!', '👆 툭툭.', '📢 어이!'],
                calm: ['💭 생각 중.', '🧘 명상 중.', '🍵 휴식.'],
                shy: ['👉👈 (꼼지락)', '🍃 혼자네..', '🔇 조용..'],
                grumpy: ['🌵 건들지 마.', '🛌 내버려둬.', '😤 쳇.'],
                energetic: ['🐜 근질근질!', '💨 답답해!', '📢 으아아!'],
            },
            l3: {
                affectionate: ['😿 나 잊었어?ㅠ', '🍂 외로워..', '😭 흑흑'],
                playful: ['🤪 엉망진창!', '😈 가만 안 둬!', '🖌️ 장난해?!'],
                calm: ['🌑 외롭군요.', '🤐 침묵.', '😶🌫️ 멍하니 있음.'],
                shy: ['🤧 (훌쩍)', '😨 무서워..', '🌃 어두워..'],
                grumpy: ['✋ 저리 가.', '🙉 조용히.', '👎 기분 별로야.'],
                energetic: ['🌋 답답해!', '🏃 뛰쳐나갈래!', '😫 아아!'],
            },
        },
        sleepy: {
            l1: {
                affectionate: ['🥱 졸려요..', '🎶 자장가..', '🧸 안아줘 zZ'],
                playful: ['🥴 더 놀래..', '🙅 안 자!', '😪 꾸벅..'],
                calm: ['🫢 하암.', '🛀 피곤하네요.', '🍵 쉴게요.'],
                shy: ['😵 (비몽사몽)', '🛌 자도 돼요?', '🤤 음냐..'],
                grumpy: ['💡 불 꺼.', '🚫 깨우지 마.', '💤 ..Zzz'],
                energetic: ['🚲 아직 쌩쌩..', '🔋 zZ', '😵 기절..'],
            },
            l2: {
                affectionate: ['🌈 꿈나라로..', '🐑 포근해..', '💤 새근새근'],
                playful: ['😴 드르렁!', '🤥 푸하아..', '💬 잠꼬대..'],
                calm: ['🛌 깊은 잠.', '🌙 숙면 중.', '🤫 조용히.'],
                shy: ['🛌 (이불 콕)', '😪 ..쿨쿨', '🌛 잘 자요..'],
                grumpy: ['👿 깨우지 마.', '🐕 ..으르렁.', '✋ 좀 쉬자.'],
                energetic: ['🔌 충전 중!', '📴 전원..오프.', '🪫 방전.'],
            },
            l3: {
                affectionate: ['🌠 잘 자..', '💜 사랑해..', '😴 zZzZ'],
                playful: ['💤 쿠우우..', '🐴 푸르르..', '🛌 쾅! (잠듦)'],
                calm: ['🌑 ...', '😶 ......', '🔇 (침묵)'],
                shy: ['👶 (쌔근쌔근)', '🌙 ...', '🫧 zZ..'],
                grumpy: ['😑 ...', '💢 건들지마..', '💤 ...'],
                energetic: ['🪫 ...', '☠️ 완전 방전.', '😵 (기절)'],
            },
        },
        sick: {
            l1: {
                affectionate: ['🤕 아야..', '🩹 호 해줘..', '🤒 아파요..'],
                playful: ['😖 으윽!', '🤥 안 아픈데?', '💥 아야!'],
                calm: ['🌡️ 몸이 안 좋네요.', '💫 어지러워요.', '🛌 휴식 필요.'],
                shy: ['😣 (끙끙)', '😢 아파..', '🤧 훌쩍..'],
                grumpy: ['🤦 이런.', '💢 아프잖아.', '😔 속상해.'],
                energetic: ['😵💫 왜 이러지?', '📉 힘 안 나..', '🥴 비틀..'],
            },
            l2: {
                affectionate: ['😭 너무 아파..', '🆘 도와줘..', '💦 엉엉'],
                playful: ['🦆 꽥!', '📢 도와주세요!', '🌀 어질어질'],
                calm: ['🏥 심각하군요.', '🔥 열이 나요.', '💊 약 좀..'],
                shy: ['😓 (식은땀)', '😨 무서워..', '🚑 도와줘요..'],
                grumpy: ['💊 약 내놔!', '😤 몸이 왜 이래.', '😣 크윽..'],
                energetic: ['🛌 일어날 수 없어..', '🏳️ 내가 지다니..', '📉 털썩.'],
            },
            l3: {
                affectionate: ['😿 너무 많이 아파..', '👋 안녕..', '🛌 쉬고 싶어..'],
                playful: ['😵 꿱.', '🎮 게임 오버.', '❌ ...'],
                calm: ['📉 한계입니다.', '🌫️ 앞이 안 보여요.', '🏥 ...'],
                shy: ['🧎 (털썩)', '😶 ...', '🏥 살려줘..'],
                grumpy: ['👿 두고 보자..', '🤐 ...', '😫 으아악!'],
                energetic: ['⏹️ ...', '⏸️ 잠시 멈춤.'],
            },
        },
        worried: {
            l1: {
                affectionate: ['😟 괜찮아?', '😥 걱정돼..', '⚠️ 조심해'],
                playful: ['😲 어라?', '💦 큰일 났다!', '😳 오잉?'],
                calm: ['🔍 살펴보는 중.', '⁉️ 문제 발생.', '🛡️ 신중하게.'],
                shy: ['😖 어쩌지..', '👣 안절부절..', '😢 히잉..'],
                grumpy: ['😒 뭐야?', '😠 기분 나빠.', '☁️ 불길해.'],
                energetic: ['🚨 비상!', '☢️ 위험해!', '🚧 조심!'],
            },
            l2: {
                affectionate: ['😨 무서워..', '🛡️ 지켜줘..', '🥶 떨려..'],
                playful: ['🏃 도망쳐!', '📢 큰일 났어!', '😱 으악!'],
                calm: ['✋ 조심하세요.', '⛔️ 위험해요.', '↩️ 피하세요.'],
                shy: ['🫨 (덜덜)', '📦 숨을래..', '🙈 못 보겠어..'],
                grumpy: ['😫 짜증 나.', '😤 비켜.', '🦁 으르렁.'],
                energetic: ['🫢 깜짝이야!', '🆘 도와주세요!', '🌪️ 우당탕탕!'],
            },
            l3: {
                affectionate: ['😭 가지 마..', '💔 혼자는 싫어..', '🧟 무서워..'],
                playful: ['😭 으앙!', '🚑 살려줘!', '🤱 엄마야!'],
                calm: ['📉 큰일이네요.', '🧩 어렵습니다.', '❌ 안돼요.'],
                shy: ['🥀 (털썩)', '💦 눈물 펑펑', '😱 말도 안 돼..'],
                grumpy: ['🚮 다 엉망이야!', '😫 망했어.', '🤬 아오!'],
                energetic: ['🤯 어떡해!', '🧱 와르르!', '🆘 살려줘!!'],
            },
        },
        angry: {
            l1: {
                affectionate: ['😤 흥!', '😞 미워!', '😒 삐짐'],
                playful: ['👊 에잇!', '🥊 투닥투닥', '⚔️ 공격!'],
                calm: ['😔 실망이네요.', '✋ 그만하세요.', '😐 불쾌합니다.'],
                shy: ['🥺 (울먹)', '😢 너무해..', '😿 미워요..'],
                grumpy: ['👉 저리 가.', '🤫 조용히 해.', '🌩️ 혼난다.'],
                energetic: ['😡 열받아!', '🥋 한판 붙자!', '🦁 으아!'],
            },
            l2: {
                affectionate: ['😠 정말 미워!', '🙅 안 놀아!', '🤥 거짓말쟁이!'],
                playful: ['💣 폭발한다!', '🐊 물어버릴 거야!', '🦖 크앙!'],
                calm: ['⚠️ 경고했습니다.', '🚫 용서 못 해요.', '🛑 하지 마세요.'],
                shy: ['😭 (엉엉)', '👋 저리 가!', '😣 싫어!'],
                grumpy: ['👿 혼나볼래?', '🙈 보지 마.', '🗯️ 용서 안 해.'],
                energetic: ['👺 화가 난다!!', '💢 화났어!', '🥊 다 덤벼!'],
            },
            l3: {
                affectionate: ['😤 흥이다!', '🙈 꼴도 보기 싫어!', '💢 흥!!'],
                playful: ['🚂 대폭주!', '🌪️ 엉망으로 만들 거야!', '😈 가만 안 둬!'],
                calm: ['😑 이제 안 봐요.', '🛑 그만.', '🔚 끝.'],
                shy: ['🌊 (대성통곡)', '😭 흐앙!!', '👶 으아앙!'],
                grumpy: ['🌋 진짜 화났어.', '💨 사라져.', '😫 으이구!'],
                energetic: ['🔥 슈퍼 분노!', '🔨 다 부셔!', '🤬 폭주!'],
            },
        },
        eat: {
            l1: {
                affectionate: ['맛있어!', '좋아!', '행복해!'],
                playful: ['냠냠!', '또 줘!', '와구와구!'],
                calm: ['좋네.', '괜찮아.', '맛나.'],
                shy: ['맛있다..', '냠..', '좋다..'],
                grumpy: ['먹을만해.', '나쁘진 않아.', '흠.'],
                energetic: ['좋아!', '더 줘!', '에너지 업!'],
            },
            l2: {
                affectionate: ['맛있어!', '좋아!', '행복해!'],
                playful: ['냠냠!', '또 줘!', '와구와구!'],
                calm: ['좋네.', '괜찮아.', '맛나.'],
                shy: ['맛있다..', '냠..', '좋다..'],
                grumpy: ['먹을만해.', '나쁘진 않아.', '흠.'],
                energetic: ['좋아!', '더 줘!', '에너지 업!'],
            },
            l3: {
                affectionate: ['맛있어!', '좋아!', '행복해!'],
                playful: ['냠냠!', '또 줘!', '와구와구!'],
                calm: ['좋네.', '괜찮아.', '맛나.'],
                shy: ['맛있다..', '냠..', '좋다..'],
                grumpy: ['먹을만해.', '나쁘진 않아.', '흠.'],
                energetic: ['좋아!', '더 줘!', '에너지 업!'],
            },
        },
        eat_aftereffect: {
            l1: {
                affectionate: ['어라..?', '배가..', '앗..'],
                playful: ['꾸르륵!', '어이쿠!', '잠깐!'],
                calm: ['신호야..', '음..', '잠깐만..'],
                shy: ['부끄..', '쉿..', '앗..'],
                grumpy: ['또야..?', '으음..', '하필..'],
                energetic: ['급해!', '비켜!', '잠깐만!'],
            },
            l2: {
                affectionate: ['어라..?', '배가..', '앗..'],
                playful: ['꾸르륵!', '어이쿠!', '잠깐!'],
                calm: ['신호야..', '음..', '잠깐만..'],
                shy: ['부끄..', '쉿..', '앗..'],
                grumpy: ['또야..?', '으음..', '하필..'],
                energetic: ['급해!', '비켜!', '잠깐만!'],
            },
            l3: {
                affectionate: ['어라..?', '배가..', '앗..'],
                playful: ['꾸르륵!', '어이쿠!', '잠깐!'],
                calm: ['신호야..', '음..', '잠깐만..'],
                shy: ['부끄..', '쉿..', '앗..'],
                grumpy: ['또야..?', '으음..', '하필..'],
                energetic: ['급해!', '비켜!', '잠깐만!'],
            },
        },
        medicine_pill: {
            l1: {
                affectionate: ['먹어볼게..', '약이네..', '괜찮아질까?'],
                playful: ['쓰다..!', '으엑!', '꼭 먹어야 해?'],
                calm: ['천천히..', '약 먹자.', '으음..'],
                shy: ['조금 무서워..', '씁쓸해..', '먹을게..'],
                grumpy: ['약은 싫어.', '쓰기만 해.', '흥..'],
                energetic: ['꿀꺽!', '금방 낫자!', '버틸래!'],
            },
            l2: {
                affectionate: ['먹어볼게..', '약이네..', '괜찮아질까?'],
                playful: ['쓰다..!', '으엑!', '꼭 먹어야 해?'],
                calm: ['천천히..', '약 먹자.', '으음..'],
                shy: ['조금 무서워..', '씁쓸해..', '먹을게..'],
                grumpy: ['약은 싫어.', '쓰기만 해.', '흥..'],
                energetic: ['꿀꺽!', '금방 낫자!', '버틸래!'],
            },
            l3: {
                affectionate: ['먹어볼게..', '약이네..', '괜찮아질까?'],
                playful: ['쓰다..!', '으엑!', '꼭 먹어야 해?'],
                calm: ['천천히..', '약 먹자.', '으음..'],
                shy: ['조금 무서워..', '씁쓸해..', '먹을게..'],
                grumpy: ['약은 싫어.', '쓰기만 해.', '흥..'],
                energetic: ['꿀꺽!', '금방 낫자!', '버틸래!'],
            },
        },
        medicine_shot: {
            l1: {
                affectionate: ['주사야..?', '아야..!', '끝났으면..'],
                playful: ['헉!', '깜짝이야!', '으아!'],
                calm: ['조금만..', '참아볼게.', '괜찮아..'],
                shy: ['무서워..', '눈 감을래..', '떨려..'],
                grumpy: ['주사는 싫어.', '아픈 건 별로야.', '흥..'],
                energetic: ['버틴다!', '금방 끝나!', '이겨낸다!'],
            },
            l2: {
                affectionate: ['주사야..?', '아야..!', '끝났으면..'],
                playful: ['헉!', '깜짝이야!', '으아!'],
                calm: ['조금만..', '참아볼게.', '괜찮아..'],
                shy: ['무서워..', '눈 감을래..', '떨려..'],
                grumpy: ['주사는 싫어.', '아픈 건 별로야.', '흥..'],
                energetic: ['버틴다!', '금방 끝나!', '이겨낸다!'],
            },
            l3: {
                affectionate: ['주사야..?', '아야..!', '끝났으면..'],
                playful: ['헉!', '깜짝이야!', '으아!'],
                calm: ['조금만..', '참아볼게.', '괜찮아..'],
                shy: ['무서워..', '눈 감을래..', '떨려..'],
                grumpy: ['주사는 싫어.', '아픈 건 별로야.', '흥..'],
                energetic: ['버틴다!', '금방 끝나!', '이겨낸다!'],
            },
        },
        clean_spot: {
            l1: {
                affectionate: ['깨끗해!', '고마워!', '좋아졌어!'],
                playful: ['싹싹!', '치웠다!', '반짝!'],
                calm: ['정리됐어.', '깔끔해.', '좋네.'],
                shy: ['다행이야..', '휴..', '이제 괜찮아..'],
                grumpy: ['이제 낫네.', '치워야지.', '흥, 됐어.'],
                energetic: ['완료!', '속 시원해!', '번쩍!'],
            },
            l2: {
                affectionate: ['깨끗해!', '고마워!', '좋아졌어!'],
                playful: ['싹싹!', '치웠다!', '반짝!'],
                calm: ['정리됐어.', '깔끔해.', '좋네.'],
                shy: ['다행이야..', '휴..', '이제 괜찮아..'],
                grumpy: ['이제 낫네.', '치워야지.', '흥, 됐어.'],
                energetic: ['완료!', '속 시원해!', '번쩍!'],
            },
            l3: {
                affectionate: ['깨끗해!', '고마워!', '좋아졌어!'],
                playful: ['싹싹!', '치웠다!', '반짝!'],
                calm: ['정리됐어.', '깔끔해.', '좋네.'],
                shy: ['다행이야..', '휴..', '이제 괜찮아..'],
                grumpy: ['이제 낫네.', '치워야지.', '흥, 됐어.'],
                energetic: ['완료!', '속 시원해!', '번쩍!'],
            },
        },
        clean_fresh: {
            l1: {
                affectionate: ['개운해!', '상쾌해!', '기분 좋아!'],
                playful: ['반짝반짝!', '보송보송!', '좋다!'],
                calm: ['깨끗해.', '상쾌하네.', '좋아.'],
                shy: ['보송해..', '기분 좋다..', '향기나..'],
                grumpy: ['깔끔하네.', '이 정도면 됐어.', '괜찮네.'],
                energetic: ['완전 상쾌해!', '새로워졌어!', '출발!'],
            },
            l2: {
                affectionate: ['개운해!', '상쾌해!', '기분 좋아!'],
                playful: ['반짝반짝!', '보송보송!', '좋다!'],
                calm: ['깨끗해.', '상쾌하네.', '좋아.'],
                shy: ['보송해..', '기분 좋다..', '향기나..'],
                grumpy: ['깔끔하네.', '이 정도면 됐어.', '괜찮네.'],
                energetic: ['완전 상쾌해!', '새로워졌어!', '출발!'],
            },
            l3: {
                affectionate: ['개운해!', '상쾌해!', '기분 좋아!'],
                playful: ['반짝반짝!', '보송보송!', '좋다!'],
                calm: ['깨끗해.', '상쾌하네.', '좋아.'],
                shy: ['보송해..', '기분 좋다..', '향기나..'],
                grumpy: ['깔끔하네.', '이 정도면 됐어.', '괜찮네.'],
                energetic: ['완전 상쾌해!', '새로워졌어!', '출발!'],
            },
        },
        emoji: {
            eat: {
                l1: { affectionate: ['😋', '🍓', '🍭'], playful: ['😋', '🍔', '😛'], calm: ['🥄', '🍵', '🍚'], shy: ['🐹', '🍪', '😋'], grumpy: ['😐', '🦴', '😑'], energetic: ['🍡', '🍚', '🥕'] },
                l2: { affectionate: ['😋', '🍓', '🍭'], playful: ['😋', '🍔', '😛'], calm: ['🥄', '🍵', '🍚'], shy: ['🐹', '🍪', '😋'], grumpy: ['😐', '🦴', '😑'], energetic: ['🍡', '🍚', '🥕'] },
                l3: { affectionate: ['😋', '🍓', '🍭'], playful: ['😋', '🍔', '😛'], calm: ['🥄', '🍵', '🍚'], shy: ['🐹', '🍪', '😋'], grumpy: ['😐', '🦴', '😑'], energetic: ['🍡', '🍚', '🥕'] },
            },
            eat_aftereffect: {
                l1: { affectionate: ['😳', '💩', '🤭'], playful: ['😳', '💩', '😯'], calm: ['😶‍🌫️', '😳', '🤭'], shy: ['🤭', '😳', '🫣'], grumpy: ['😮‍💨', '😑', '💩'], energetic: ['😯', '💨', '💩'] },
                l2: { affectionate: ['😳', '💩', '🤭'], playful: ['😳', '💩', '😯'], calm: ['😶‍🌫️', '😳', '🤭'], shy: ['🤭', '😳', '🫣'], grumpy: ['😮‍💨', '😑', '💩'], energetic: ['😯', '💨', '💩'] },
                l3: { affectionate: ['😳', '💩', '🤭'], playful: ['😳', '💩', '😯'], calm: ['😶‍🌫️', '😳', '🤭'], shy: ['🤭', '😳', '🫣'], grumpy: ['😮‍💨', '😑', '💩'], energetic: ['😯', '💨', '💩'] },
            },
            medicine_pill: {
                l1: { affectionate: ['💊', '😣', '🤒'], playful: ['💊', '😬', '🥴'], calm: ['💊', '😮‍💨', '😶'], shy: ['😣', '🫣', '💊'], grumpy: ['😒', '💊', '😤'], energetic: ['💊', '😬', '✨'] },
                l2: { affectionate: ['💊', '😣', '🤒'], playful: ['💊', '😬', '🥴'], calm: ['💊', '😮‍💨', '😶'], shy: ['😣', '🫣', '💊'], grumpy: ['😒', '💊', '😤'], energetic: ['💊', '😬', '✨'] },
                l3: { affectionate: ['💊', '😣', '🤒'], playful: ['💊', '😬', '🥴'], calm: ['💊', '😮‍💨', '😶'], shy: ['😣', '🫣', '💊'], grumpy: ['😒', '💊', '😤'], energetic: ['💊', '😬', '✨'] },
            },
            medicine_shot: {
                l1: { affectionate: ['💉', '😳', '😖'], playful: ['💉', '😱', '😬'], calm: ['💉', '😮‍💨', '😶'], shy: ['🫣', '😖', '💉'], grumpy: ['😤', '💉', '😒'], energetic: ['💉', '😤', '✨'] },
                l2: { affectionate: ['💉', '😳', '😖'], playful: ['💉', '😱', '😬'], calm: ['💉', '😮‍💨', '😶'], shy: ['🫣', '😖', '💉'], grumpy: ['😤', '💉', '😒'], energetic: ['💉', '😤', '✨'] },
                l3: { affectionate: ['💉', '😳', '😖'], playful: ['💉', '😱', '😬'], calm: ['💉', '😮‍💨', '😶'], shy: ['🫣', '😖', '💉'], grumpy: ['😤', '💉', '😒'], energetic: ['💉', '😤', '✨'] },
            },
            clean_spot: {
                l1: { affectionate: ['🧹', '✨', '😌'], playful: ['🧹', '🗞️', '✨'], calm: ['✨', '😌', '🫧'], shy: ['😌', '✨', '🫧'], grumpy: ['🧹', '😑', '✨'], energetic: ['✨', '🌟', '🧹'] },
                l2: { affectionate: ['🧹', '✨', '😌'], playful: ['🧹', '🗞️', '✨'], calm: ['✨', '😌', '🫧'], shy: ['😌', '✨', '🫧'], grumpy: ['🧹', '😑', '✨'], energetic: ['✨', '🌟', '🧹'] },
                l3: { affectionate: ['🧹', '✨', '😌'], playful: ['🧹', '🗞️', '✨'], calm: ['✨', '😌', '🫧'], shy: ['😌', '✨', '🫧'], grumpy: ['🧹', '😑', '✨'], energetic: ['✨', '🌟', '🧹'] },
            },
            clean_fresh: {
                l1: { affectionate: ['🚿', '✨', '🌿'], playful: ['🪥', '✨', '🫧'], calm: ['🌿', '😌', '✨'], shy: ['🫧', '✨', '🌸'], grumpy: ['🪥', '😑', '✨'], energetic: ['🚿', '💫', '✨'] },
                l2: { affectionate: ['🚿', '✨', '🌿'], playful: ['🪥', '✨', '🫧'], calm: ['🌿', '😌', '✨'], shy: ['🫧', '✨', '🌸'], grumpy: ['🪥', '😑', '✨'], energetic: ['🚿', '💫', '✨'] },
                l3: { affectionate: ['🚿', '✨', '🌿'], playful: ['🪥', '✨', '🫧'], calm: ['🌿', '😌', '✨'], shy: ['🫧', '✨', '🌸'], grumpy: ['🪥', '😑', '✨'], energetic: ['🚿', '💫', '✨'] },
            },
            joy: {
                l1: { affectionate: ['😊', '🍼', '✨'], playful: ['😆', '🎶', '😁'], calm: ['😌', '🎵', '👌'], shy: ['☺️', '😳', '😚'], grumpy: ['😒', '😏', '🙄'], energetic: ['✨', '👍', '😲'] },
                l2: { affectionate: ['🥰', '🌈', '🎈'], playful: ['🏃', '⚽️', '🦖'], calm: ['☕️', '🍀', '🍃'], shy: ['😽', '🌸', '🙈'], grumpy: ['😑', '😼', '😮'], energetic: ['🏆', '💪', '🚀'] },
                l3: { affectionate: ['❤️', '💖', '🌟'], playful: ['💡', '👑', '😂'], calm: ['🙏', '🙇', '👏'], shy: ['🍅', '🎁', '🦄'], grumpy: ['🆗', '💬', '😤'], energetic: ['🔥', '🌍', '📢'] },
            },
            love: {
                l1: { affectionate: ['😘', '🐣', '👋'], playful: ['🎣', '💎', '👉'], calm: ['🌤️', '👤', '🛡️'], shy: ['😺', '🧣', '😊'], grumpy: ['😕', '✋', '😤'], energetic: ['💘', '🤜🤛', '👍'] },
                l2: { affectionate: ['🤗', '🌞', '💋'], playful: ['👐', '🐨', '🏹'], calm: ['💎', '🌲', '🤝'], shy: ['☺️', '💌', '💓'], grumpy: ['😳', '⏱️', '😒'], energetic: ['⚡️', '🤖', '♾️'] },
                l3: { affectionate: ['🏡', '👫', '💝'], playful: ['👮', '🎖️', '🫡'], calm: ['💐', '🧶', '✨'], shy: ['🫂', '😻', '🍀'], grumpy: ['😎', '😠', '🐕'], energetic: ['👯', '🚀', '🎉'] },
            },
            playful: {
                l1: { affectionate: ['😋', '🍓', '🍭'], playful: ['🐊', '🍔', '😛'], calm: ['🥄', '🍵', '🥗'], shy: ['🐹', '🍪', '🐿️'], grumpy: ['😐', '🦴', '😑'], energetic: ['🍡', '🍚', '🥕'] },
                l2: { affectionate: ['🎡', '🤣', '😆'], playful: ['🔫', '⚔️', '🛡️'], calm: ['🧐', '🎲', '😏'], shy: ['🫣', '👉👈', '👻'], grumpy: ['🛑', '😩', '👋'], energetic: ['🐇', '🌀', '💨'] },
                l3: { affectionate: ['🎪', '🎈', '😵'], playful: ['🎆', '🎺', '🦸'], calm: ['🥺', '😲', '👏'], shy: ['🤭', '✨', '🤩'], grumpy: ['🙀', '😼', '👀'], energetic: ['📈', '🚄', '🏎️'] },
            },
            neutral: {
                l1: { affectionate: ['🧸', '🥺', '💧'], playful: ['🤔', '😈', '💬'], calm: ['🤫', '😶', '🕊️'], shy: ['👀', '😐', '🐜'], grumpy: ['😩', '🌬️', '😑'], energetic: ['🤸', '🚪', '💣'] },
                l2: { affectionate: ['🔭', '👣', '🐕'], playful: ['⚡️', '👆', '📢'], calm: ['💭', '🧘', '🍵'], shy: ['👉👈', '🍃', '🔇'], grumpy: ['🌵', '🛌', '😤'], energetic: ['🐜', '💨', '📢'] },
                l3: { affectionate: ['😿', '🍂', '😭'], playful: ['🤪', '😈', '🖌️'], calm: ['🌑', '🤐', '😶'], shy: ['🤧', '😨', '🌃'], grumpy: ['✋', '🙉', '👎'], energetic: ['🌋', '🏃', '😫'] },
            },
            sleepy: {
                l1: { affectionate: ['🥱', '🎶', '🧸'], playful: ['🥴', '🙅', '😪'], calm: ['🫢', '🛀', '🍵'], shy: ['😵', '🛌', '🤤'], grumpy: ['💡', '🚫', '💤'], energetic: ['🚲', '🔋', '😵'] },
                l2: { affectionate: ['🌈', '🐑', '💤'], playful: ['😴', '🤥', '💬'], calm: ['🛌', '🌙', '🤫'], shy: ['🛌', '😪', '🌛'], grumpy: ['👿', '🐕', '✋'], energetic: ['🔌', '📴', '🪫'] },
                l3: { affectionate: ['🌠', '💜', '😴'], playful: ['💤', '🐴', '🛌'], calm: ['🌑', '😶', '🔇'], shy: ['👶', '🌙', '🫧'], grumpy: ['😑', '💢', '💤'], energetic: ['🪫', '☠️', '😵'] },
            },
            sick: {
                l1: { affectionate: ['🤕', '🩹', '🤒'], playful: ['😖', '🤥', '💥'], calm: ['🌡️', '💫', '🛌'], shy: ['😣', '😢', '🤧'], grumpy: ['🤦', '💢', '😔'], energetic: ['😵', '📉', '🥴'] },
                l2: { affectionate: ['😭', '🆘', '💦'], playful: ['🦆', '📢', '🌀'], calm: ['🏥', '🔥', '💊'], shy: ['😓', '😨', '🚑'], grumpy: ['💊', '😤', '😣'], energetic: ['🛌', '🏳️', '📉'] },
                l3: { affectionate: ['😿', '👋', '🛌'], playful: ['😵', '🎮', '❌'], calm: ['📉', '🌫️', '🏥'], shy: ['🧎', '😶', '🏥'], grumpy: ['👿', '🤐', '😫'], energetic: ['⏹️', '⏸️'] },
            },
            worried: {
                l1: { affectionate: ['😟', '😥', '⚠️'], playful: ['😲', '💦', '😳'], calm: ['🔍', '⁉️', '🛡️'], shy: ['😖', '👣', '😢'], grumpy: ['😒', '😠', '☁️'], energetic: ['🚨', '☢️', '🚧'] },
                l2: { affectionate: ['😨', '🛡️', '🥶'], playful: ['🏃', '📢', '😱'], calm: ['✋', '⛔️', '↩️'], shy: ['🫨', '📦', '🙈'], grumpy: ['😫', '😤', '🦁'], energetic: ['🫢', '🆘', '🌪️'] },
                l3: { affectionate: ['😭', '💔', '🧟'], playful: ['😭', '🚑', '🤱'], calm: ['📉', '🧩', '❌'], shy: ['🥀', '💦', '😱'], grumpy: ['🚮', '😫', '🤬'], energetic: ['🤯', '🧱', '🆘'] },
            },
            angry: {
                l1: { affectionate: ['😤', '😞', '😒'], playful: ['👊', '🥊', '⚔️'], calm: ['😔', '✋', '😐'], shy: ['🥺', '😢', '😿'], grumpy: ['👉', '🤫', '🌩️'], energetic: ['😡', '🥋', '🦁'] },
                l2: { affectionate: ['😠', '🙅', '🤥'], playful: ['💣', '🐊', '🦖'], calm: ['⚠️', '🚫', '🛑'], shy: ['😭', '👋', '😣'], grumpy: ['👿', '🙈', '🗯️'], energetic: ['👺', '💢', '🥊'] },
                l3: { affectionate: ['😤', '🙈', '💢'], playful: ['🚂', '🌪️', '😈'], calm: ['😑', '🛑', '🔚'], shy: ['🌊', '😭', '👶'], grumpy: ['🌋', '💨', '😫'], energetic: ['🔥', '🔨', '🤬'] },
            },
        },
        toddler: {
            joy: {
                l1: { affectionate: ['😊 헤헤', '🍼 야호!', '✨ 반짝!'], playful: ['😆 신난다!', '🎶 룰루!', '😁 히히!'], calm: ['😌 음~', '🎵 흥얼~', '👌 좋아!'], shy: ['☺️ 헤헤..', '😳 어..', '😚 쪽!'], grumpy: ['😒 흥.', '😏 흠.', '🙄 나쁘진 않아.'], energetic: ['✨ 와!', '👍 오오!', '😲 우와!'] },
                l2: { affectionate: ['🥰 행복해!', '🌈 야호!', '🎈 꺄!'], playful: ['🏃 달려!', '⚽️ 놀자!', '🦖 어흥!'], calm: ['☕️ 좋아.', '🍀 괜찮아.', '🍃 아아~'], shy: ['😽 고마워..', '🌸 헤헤..', '🙈 부끄..'], grumpy: ['😑 알겠어.', '😼 흠.', '😮 오.'], energetic: ['🏆 최고!', '💪 파워!', '🚀 가자!'] },
                l3: { affectionate: ['❤️ 사랑해!', '💖 신난다!!', '🌟 별이다!'], playful: ['💡 아하!', '👑 내가 짱!', '😂 하하!'], calm: ['🙏 고마워.', '🙇 꾸벅.', '👏 짝짝!'], shy: ['🍅 얼굴 빨개..', '🎁 고마워..', '🦄 꿈같아..'], grumpy: ['🆗 오케이.', '💬 ..고마워.', '😤 흥!'], energetic: ['🔥 불꽃!', '🌍 세상!', '📢 소리 질러!'] },
            },
            love: {
                l1: { affectionate: ['😘 쪽!', '🐣 귀여워!', '👋 토닥토닥'], playful: ['🎣 잡았다!', '💎 내 거!', '👉 얍!'], calm: ['🌤️ 휴.', '👤 좋아.', '🛡️ 든든해.'], shy: ['😺 부비..', '🧣 따뜻해..', '😊 헤헤..'], grumpy: ['😕 뭐야?', '✋ 비켜.', '😤 흥.'], energetic: ['💘 하트!', '🤜🤛 베프!', '👍 최고!'] },
                l2: { affectionate: ['🤗 안아줘!', '🌞 포근해~', '💋 쪽!'], playful: ['👐 간질간질!', '🐨 찰싹!', '🏹 안 놔!'], calm: ['💎 소중해.', '🌲 곁에 있을게.', '🤝 믿어.'], shy: ['☺️ 부끄..', '💌 좋아해..', '💓 두근..'], grumpy: ['😳 따뜻하네..', '⏱️ 잠깐만.', '😒 흥..'], energetic: ['⚡️ 우정 파워!', '🤖 합체!', '♾️ 영원히!'] },
                l3: { affectionate: ['🏡 평생 함께!', '👫 베스트 친구!', '💝 사랑 가득!'], playful: ['👮 멈춰!', '🎖️ 인증 베프!', '🫡 대장님!'], calm: ['💐 정말 고마워.', '🧶 운명이야.', '✨ 축복!'], shy: ['🫂 꼭 안아..', '😻 너 좋아..', '🍀 행복해..'], grumpy: ['😎 너.. 괜찮네.', '😠 좋아서 그런 건 아냐..', '🐕 옆에 있어.'], energetic: ['👯 환상 콤보!', '🚀 우주로!', '🎉 예에!!'] },
            },
            playful: {
                l1: { affectionate: ['😋 냠!', '🍓 딸기!', '🍭 달콤!'], playful: ['🐊 와앙!', '🍔 냠냠', '😛 메롱!'], calm: ['🥄 먹자.', '🍵 홀짝.', '🥗 맛있어.'], shy: ['🐹 오물오물..', '🍪 맛나..', '🐿️ 냠..'], grumpy: ['😐 먹을만해.', '🦴 와앙.', '😑 흥.'], energetic: ['🍡 한입 꿀꺽!', '🍚 더 줘!', '🥕 아삭!'] },
                l2: { affectionate: ['🎡 재밌다!', '🤣 간질간질~', '😆 하하!'], playful: ['🔫 받아라!', '⚔️ 공격!', '🛡️ 피하기!'], calm: ['🧐 흠.', '🎲 재밌어.', '😏 후후.'], shy: ['🫣 빼꼼!', '👉👈 음..', '👻 깜짝!'], grumpy: ['🛑 그만.', '😩 귀찮아.', '👋 저리 가.'], energetic: ['🐇 폴짝!', '🌀 빙글!', '💨 슝!'] },
                l3: { affectionate: ['🎪 파티다!', '🎈 날아간다!', '😵 빙글!'], playful: ['🎆 빵!', '🎺 빰빠라밤!', '🦸 슈퍼!'], calm: ['🥺 감동..', '😲 우와.', '👏 박수!'], shy: ['🤭 키득..', '✨ 반짝..', '🤩 오오..'], grumpy: ['🙀 깜짝!', '😼 나쁘진?', '👀 오호.'], energetic: ['📈 업!', '🚄 가자!', '🏎️ 초고속!'] },
            },
            neutral: {
                l1: { affectionate: ['🧸 심심해..', '🥺 놀아줘..', '💧 훌쩍'], playful: ['🤔 뭐 하지?', '😈 장난칠까?', '💬 심심..'], calm: ['🤫 조용.', '😶 ...', '🕊️ 평화.'], shy: ['👀 힐끔', '😐 ...', '🐜 음..'], grumpy: ['😩 노잼이야.', '🌬️ 하아..', '😑 재미없어.'], energetic: ['🤸 몸이 근질!', '🚪 나가자!', '💣 심심 폭발!'] },
                l2: { affectionate: ['🔭 보고 싶어..', '👣 어디 갔어?', '🐕 기다릴게.'], playful: ['⚡️ 찌릿!', '👆 콕콕.', '📢 야!'], calm: ['💭 생각 중.', '🧘 명상.', '🍵 쉬는 중.'], shy: ['👉👈 꼼지락', '🍃 혼자..', '🔇 조용히..'], grumpy: ['🌵 건들지 마.', '🛌 나 둬.', '😤 칫.'], energetic: ['🐜 근질근질!', '💨 답답해!', '📢 으아!'] },
                l3: { affectionate: ['😿 나 잊었어?', '🍂 외로워..', '😭 훌쩍'], playful: ['🤪 엉망진창!', '😈 괴롭힐 거야!', '🖌️ 장난해?!'], calm: ['🌑 쓸쓸해.', '🤐 침묵.', '😶 멍..'], shy: ['🤧 훌쩍', '😨 무서워..', '🌃 어두워..'], grumpy: ['✋ 저리 가.', '🙉 조용히.', '👎 기분 나빠.'], energetic: ['🌋 답답해!', '🏃 뛰어야지!', '😫 아아!'] },
            },
            sleepy: {
                l1: { affectionate: ['🥱 하암..', '🎶 자장자장', '🧸 안고 zZ'], playful: ['🥴 더 놀자..', '🙅 안 잘래', '😪 꾸벅..'], calm: ['🫢 하품.', '🛀 피곤해.', '🍵 쉬자.'], shy: ['😵 몽롱..', '🛌 자도 돼?', '🤤 졸려..'], grumpy: ['💡 불 꺼.', '🚫 깨우지 마.', '💤 쿨쿨'], energetic: ['🚲 안 피곤해..', '🔋 zZ', '😵 쓰러질래..'] },
                l2: { affectionate: ['🌈 꿈나라..', '🐑 포근해..', '💤 쿨쿨..'], playful: ['😴 코오~', '🤥 휴..', '💬 잠꼬대..'], calm: ['🛌 푹 잔다.', '🌙 잘 자는 중.', '🤫 조용히.'], shy: ['🛌 이불 속', '😪 ..zz', '🌛 잘 자..'], grumpy: ['👿 깨우지 마.', '🐕 ..그르르.', '✋ 좀 쉬자.'], energetic: ['🔌 충전 중!', '📴 전원..off.', '🪫 방전이야.'] },
                l3: { affectionate: ['🌠 잘 자..', '💜 사랑해..', '😴 zZzZ'], playful: ['💤 드르렁..', '🐴 그릉..', '🛌 털썩!'], calm: ['🌑 ...', '😶 ......', '🔇 (고요)'], shy: ['👶 새근새근', '🌙 ...', '🫧 zZ..'], grumpy: ['😑 ...', '💢 좀 쉴래..', '💤 ...'], energetic: ['🪫 ...', '☠️ 완전 방전.', '😵 (기절)'] },
            },
            sick: {
                l1: { affectionate: ['🤕 아야..', '🩹 도와줘..', '🤒 아파..'], playful: ['😖 윽!', '🤥 안 아픈데?', '💥 아야!'], calm: ['🌡️ 몸이 안 좋아.', '💫 어지러워.', '🛌 쉬어야 해.'], shy: ['😣 끙..', '😢 아파..', '🤧 훌쩍..'], grumpy: ['🤦 으..', '💢 아프다.', '😔 속상해.'], energetic: ['😵 왜 이래?', '📉 힘이 없어..', '🥴 비틀..'] },
                l2: { affectionate: ['😭 너무 아파..', '🆘 살려줘..', '💦 훌쩍'], playful: ['🦆 꽥!', '📢 도와줘!', '🌀 핑글'], calm: ['🏥 심각해.', '🔥 열나.', '💊 약 줘..'], shy: ['😓 식은땀', '😨 무서워..', '🚑 도와줘..'], grumpy: ['💊 약!', '😤 몸이 왜 이래.', '😣 으으..'], energetic: ['🛌 못 일어나..', '🏳️ 졌어..', '📉 털썩.'] },
                l3: { affectionate: ['😿 너무 아파..', '👋 나중에..', '🛌 쉬고 싶어..'], playful: ['😵 으악.', '🎮 게임 오버.', '❌ ...'], calm: ['📉 한계야.', '🌫️ 흐릿해.', '🏥 ...'], shy: ['🧎 (털썩)', '😶 ...', '🏥 살려줘..'], grumpy: ['👿 두고 봐..', '🤐 ...', '😫 으아!'], energetic: ['⏹️ ...', '⏸️ 멈춤.'] },
            },
            worried: {
                l1: { affectionate: ['😟 괜찮아?', '😥 걱정돼..', '⚠️ 조심해'], playful: ['😲 어?', '💦 큰일!', '😳 엇?'], calm: ['🔍 살펴보는 중.', '⁉️ 문제야?', '🛡️ 조심조심.'], shy: ['😖 어떡하지..', '👣 안절부절..', '😢 흑..'], grumpy: ['😒 뭐야?', '😠 느낌 안 좋아.', '☁️ 불길해.'], energetic: ['🚨 비상!', '☢️ 위험해!', '🚧 조심해!'] },
                l2: { affectionate: ['😨 무서워..', '🛡️ 지켜줘..', '🥶 덜덜..'], playful: ['🏃 도망!', '📢 큰일이야!', '😱 아아!'], calm: ['✋ 경고.', '⛔️ 위험.', '↩️ 피하자.'], shy: ['🫨 (덜덜)', '📦 숨자..', '🙈 못 보겠어..'], grumpy: ['😫 불안해.', '😤 잠깐만.', '🦁 으르릉.'], energetic: ['🫢 헉!', '🆘 도와줘!', '🌪️ 쾅!'] },
                l3: { affectionate: ['😭 가지 마..', '💔 혼자 싫어..', '🧟 무서워..'], playful: ['😭 으앙!', '🚑 살려줘!', '🤱 엄마!'], calm: ['📉 절망이야.', '🧩 통제가 안 돼.', '❌ 끝났어.'], shy: ['🥀 (털썩)', '💦 눈물', '😱 안 돼..'], grumpy: ['🚮 큰일이야.', '😫 끝장이야.', '🤬 으악!'], energetic: ['🤯 패닉!', '🧱 쾅!', '🆘 도와줘!!'] },
            },
            angry: {
                l1: { affectionate: ['😤 흥!', '😞 못됐어!', '😒 삐짐'], playful: ['👊 흥!', '🥊 퍽퍽', '⚔️ 공격!'], calm: ['😔 실망이야.', '✋ 그만.', '😐 기분 나빠.'], shy: ['🥺 (훌쩍)', '😢 너무해..', '😿 미워..'], grumpy: ['👉 싫어.', '🤫 조용히.', '🌩️ 그만.'], energetic: ['😡 화났어!', '🥋 싸우자!', '🦁 으아!'] },
                l2: { affectionate: ['😠 진짜 못됐어!', '🙅 안 놀아!', '🤥 거짓말쟁이!'], playful: ['💣 펑!', '🐊 물어버릴래!', '🦖 어흥!'], calm: ['⚠️ 경고했어.', '🚫 용서 없어.', '🛑 선 넘었어.'], shy: ['😭 (엉엉)', '👋 저리 가!', '😣 싫어!'], grumpy: ['👿 짜증나.', '🙈 보지 마.', '🗯️ 화났어.'], energetic: ['👺 화났어!', '💢 짜증나!', '🥊 덤벼!'] },
                l3: { affectionate: ['😤 끝이야!', '🙈 보기 싫어!', '💢 흥!!'], playful: ['🚂 우당탕!', '🌪️ 정말 화나!', '😈 안 놔줘!'], calm: ['😑 끝났어.', '🛑 차단.', '🔚 종료.'], shy: ['🌊 (엉엉)', '😭 으아앙!', '👶 으앙!'], grumpy: ['🌋 화난다.', '💨 저리 가.', '😫 으아!'], energetic: ['🔥 엄청 화나!', '🔨 으아!', '🤬 난리다!'] },
            },
        },
    },
    abandonment: {
        danger: '관심이 필요해요!',
        critical: '위험한 상태입니다!',
        leaving: '곧 떠날 것 같아요!',
        abandoned: '젤로가 떠났습니다... ㅠㅠ',
    },
    settings: {
        title: '설정',
        sound: {
            title: '사운드',
            description: '소리 설정',
            bgm: '배경음악',
            sfx: '효과음',
            on: '켜기',
            off: '끄기',
        },
        language: {
            title: '언어',
            description: '언어 선택',
            selected: '선택됨',
        },
        admin: {
            title: '관리',
            gallery: '도감',
            stats: '통계',
        },
        cloudSave: '클라우드 저장',
        logout: '로그아웃',
        saveStatus: {
            idle: '클라우드 저장',
            saving: '저장 중...',
            success: '저장 완료!',
            error: '저장 실패',
            cooldown: '{{time}}초 대기',
        },
    },
    encyclopedia: {
        title: '마이 젤로 박스',
        home: '홈',
        species: '종족',
        stage: '단계 {{stage}}',
        hidden: '???',
        legendary: {
            title: '전설의 진화',
            prefix: '이 모습을 해금하려면',
            suffix: '이(가) 필요해요!',
        },
    },
    auth: {
        promo: {
            title: '젤로를 지켜주세요!',
            desc: '2단계로 진화하려면 진행 상황 저장이 필요합니다. <highlight>지금 가입하여</highlight> 젤로를 영원히 안전하게 보관하세요!',
            later: '다음에 할게요',
        },
        login: {
            title: '로그인',
            subtitle: '귀여운 젤로가 기다리고있어요!',
            email: '이메일',
            emailPlaceholder: '이메일을 입력하세요',
            password: '비밀번호',
            passwordPlaceholder: '비밀번호를 입력하세요',
            or: '또는',
            google: 'Google로 계속하기',
            signup: '이메일로 회원가입',
            action: '로그인', // Explicit action key
        },
        signup: {
            title: '회원가입',
            subtitle: '젤로와의 소중한 시간을 기록하세요.',
            emailLabel: '이메일',
            emailPlaceholder: '이메일을 입력하세요',
            passwordLabel: '비밀번호',
            passwordPlaceholder: '비밀번호를 입력하세요 (6자 이상)',
            confirmPasswordLabel: '비밀번호 확인',
            confirmPasswordPlaceholder: '비밀번호를 다시 입력하세요',
            haveAccount: '이미 계정이 있으신가요?',
            loginLink: '로그인하기',
            passwordMismatch: '비밀번호가 일치하지 않습니다.',
            success: '회원가입이 완료되었습니다!',
            action: '회원가입', // Explicit action key
        },
        errors: {
            default: '로그인에 실패했습니다.',
            invalidCredential: '이메일 또는 비밀번호가 올바르지 않습니다.',
            tooManyRequests: '너무 많은 시도가 있었습니다. 잠시 후 다시 시도해주세요.',
            googleFailed: 'Google 로그인에 실패했습니다.',
            registrationFailed: '회원가입에 실패했습니다.',
            emailInUse: '이미 사용 중인 이메일입니다.',
            weakPassword: '비밀번호는 6자 이상이어야 합니다.',
            invalidEmail: '유효하지 않은 이메일 형식입니다.',
        },
        logging_in: '로그인 중...',
        signing_up: '가입 중...',
    },
    play: {
        title: '놀이 & 학습',
        home: '홈',
        controls: {
            title: "같이 놀자!",
            expand: '펼치기',
            collapse: '접기',
            level: '레벨',
        },
        modes: {
            adventure: '어드벤처',
            genius: '지니어스',
        },
        sections: {
            funMath: {
                title: '즐거운 놀이수학',
                desc: '재미있는 수학 모험',
            },
            training: {
                desc: '트레이닝 모듈',
            },
            genius: {
                title: '지니어스 연산',
                desc: "천재들의 '비밀' 계산법",
            },
        },
        categories: {
            brain: '두뇌',
            math: '수학',
            science: '설정',
            sw: '코딩',
        },
        worlds: {
            level1: '워터 월드',
            level2: '포레스트 월드',
            level3: '데저트 월드',
        },
        comingSoon: {
            nextAdventure: '다음 모험',
            title: '곧 공개',
        },
        game: {
            playNow: '지금 플레이',
            reset: '처음부터',
            noGames: '새로운 게임이 준비 중입니다!',
            unlock: {
                reason: '{{game}} 마스터 등급 달성 시 해금',
            },
        },
    },
    games: {
        'math-fishing-count': fishingCountKo,
    'tenframe-number': tenFrameNumberLocale,
    'ten-frame-add': tenFrameAddLocale,
    'mole-whack': moleWhackLocale,
        'math-round-counting': roundCountingKo,
        'math-compare-critters': compareCrittersKo,
        'math-number-hive': numberHiveKo,
        'math-fruit-slice': fruitSliceKo,
        'math-number-balance': numberBalanceKo,
        'math-archery': mathArcheryKo,
        'jello-feeding': jelloFeedingKo,
        frontAddition: frontAdditionKo,
        frontSubtraction: frontSubtractionKo,
        backMultiplication: backMultiplicationKo,
        'ten-frame-count': tenFrameCountKo,
        'pinwheel-pop': mathPinwheelKo,
        'shape-sum-link': shapeSumLinkKo,
        'fruit-box': fruitBoxKo,
        'ice-stacking': iceStackingKo,
        'floor-tiler': floorTilerKo,
        'frog-jump': frogJumpKo,
        'chip-cashier': chipCashierKo,
        'cell-clone': cellCloneKo,
        'fair-share': fairShareLocale,
        'donut-shop': donutShopLocale,
        'chocolate-split': chocolateSplitLocale,
        'scorpion-king': scorpionKingLocale,
        'pizza-pizza': pizzaPizzaLocale,
        'river-crossing': riverCrossingLocale,
        'neon-matrix': neonMatrixKo,
        'three-leaf-clover': threeLeafCloverLocale,
        'hex-hive-six': hexHiveSixLocale,
        'flight-calendar': flightCalendarLocale,
        'ten-frame-pop': tenFramePopLocale,
        'beginner-wizard': beginnerWizardKo,
        'constellation-finder': constellationFinderKo,
        'troll-attack': trollAttackKo,
        'animal-banquet': animalBanquetKo,
        'deep-sea-dive': deepSeaDiveKo,
        'math-level2-ufo-invasion': ufoInvasionKo,

        'color-link': colorLinkKo,
        'pair-up-twin': pairUpTwinKo,
        'maze-escape': mazeEscapeKo,
        'wild-link': wildLinkKo,
        'pair-up-connect': pairUpConnectKo,
        'signal-hunter': signalHunterKo,
        'block-tower': blockTowerKo,
        sharpshooter: sharpshooterKo,
        'maze-hunter': mazeHunterKo,
        'tic-tac-toe': ticTacToeKo,
        omok: omokKo,
        cargoTrain: cargoTrainKo,
        rocketLauncher: rocketLauncherKo,
        
    
    
    'math-lock-opening': lockOpeningLocale,
    'math-magic-potion': magicPotionLocale,
    
    
        tags: {
            counting: '수 세기',
            sequence: '수 순서',
            numberSense: '수 감각',
            addition: '덧셈',
            subtraction: '뺄셈',
            partWhole: '가르기와 모으기',
            mixedOps: '혼합 연산',
            speedMath: '빠른 연산',
            mentalMath: '암산',
            spatial: '공간 지각',
            observation: '관찰력',
            categorization: '범주화',
            workingMemory: '작업 기억',
            association: '연상',
            concentration: '집중력',
            strategy: '전략',
            memory: '기억력',
            logic: '논리',
            comparison: '비교',
            division: '나눗셈',
            multiplication: '곱셈',
        },
        mission: {
            challenge: '성공 도전! ({{current}}/{{total}})',
            challenge10: '도전! ({{current}}/{{total}})',
        },
        medal: {
            bronze: '🥈 은메달까지 {{count}}판 남았어요!',
            silver: '🥇 금메달까지 {{count}}판 남았어요!',
            gold: '최고에요! 마스터하셨군요! 🎉',
        },
    },
    giftBox: {
        nicknameTitle: '만나서 반가워요!',
        nicknamePlaceholder: '젤로 이름을 입력해주세요',
        saveError: '이름을 저장하지 못했어요. 다시 시도해주세요.',
        startButton: '시작! ✨',
        saving: '저장 중...',
        tapHint: '탭! {{current}}/{{max}}',
        holdHint: '길게 눌러 부화',
    },
    dailyRoutine: {
        title: '데일리 루틴',
        claim: '보상 받기',
        claiming: '보상 받는 중...',
        claimed: '오늘 완료',
        done: '완료',
        inProgress: '진행 중',
        task: {
            studyStars: '게임완료 5회',
            petTouch: '쓰다듬기 5회',
            feedCategory: '{{category}} 주기 3회',
            brushTeeth: '이닦기 2회',
            shower: '샤워시키기 2회',
            cleanPoop: '청소하기 2회',
            cleanBug: '벌레 잡기 1회',
            sleep: '잠자기 1회',
        },
        foodCategory: {
            fruit: '과일',
            vegetable: '야채',
            bakery: '베이크',
            meal: '음식',
            dessert: '디저트',
        },
        reward: {
            title: '일일 루틴 보상',
        },
        error: {
            loginRequired: '일일 루틴 보상을 받으려면 로그인이 필요해요.',
            alreadyClaimed: '오늘의 일일 루틴 보상은 이미 받았어요.',
            claimFailed: '일일 루틴 보상을 받지 못했어요.',
        },
    },
    train: {
        reward: {
            glo: 'GLO',
            dud: '꽝!',
            confirm: '확인',
        },
    },
} as const;

const toddlerToneStemsKo: Record<string, Record<string, string>> = {
    joy: {
        affectionate: '좋아',
        playful: '신나',
        calm: '편해',
        shy: '부끄러',
        grumpy: '흥',
        energetic: '가자',
    },
    love: {
        affectionate: '좋아해',
        playful: '안아줘',
        calm: '안심이야',
        shy: '두근두근',
        grumpy: '삐졌어',
        energetic: '완전 좋아',
    },
    playful: {
        affectionate: '재밌어',
        playful: '놀자',
        calm: '천천히',
        shy: '헤헤',
        grumpy: '싫어',
        energetic: '빨리',
    },
    neutral: {
        affectionate: '같이 있어',
        playful: '뭐하지',
        calm: '느긋해',
        shy: '조금 무서워',
        grumpy: '맘에 안 들어',
        energetic: '움직이고 싶어',
    },
    sleepy: {
        affectionate: '졸려',
        playful: '조금만 더',
        calm: '잘래',
        shy: '하암',
        grumpy: '조용히 해',
        energetic: '배터리 없어',
    },
    sick: {
        affectionate: '아파',
        playful: '힘들어',
        calm: '쉴래',
        shy: '찡긋 아파',
        grumpy: '아야',
        energetic: '힘이 없어',
    },
    worried: {
        affectionate: '걱정돼',
        playful: '어쩌지',
        calm: '진정해',
        shy: '무서워',
        grumpy: '짜증나',
        energetic: '큰일이야',
    },
    angry: {
        affectionate: '화났어',
        playful: '삐졌어',
        calm: '그만해',
        shy: '으으',
        grumpy: '싫다',
        energetic: '진짜 화났어',
    },
};

const toddlerSuffixKo: Record<'l1' | 'l2' | 'l3', string[]> = {
    l1: ['~', '!', '야'],
    l2: ['~~', '!!', '라구!'],
    l3: ['!!!', ' 진짜!', ' 거야!'],
};

const buildEmotionToddlerKo = (emojiSource: any) => {
    const result: any = {};
    for (const [mood, moodValue] of Object.entries(emojiSource || {})) {
        result[mood] = {};
        for (const [level, levelValue] of Object.entries(moodValue as Record<string, any>)) {
            result[mood][level] = {};
            for (const [tone, emojis] of Object.entries(levelValue as Record<string, string[]>)) {
                const stem = toddlerToneStemsKo[mood]?.[tone] || '응';
                const suffixes =
                    toddlerSuffixKo[level as 'l1' | 'l2' | 'l3'] || toddlerSuffixKo.l1;
                result[mood][level][tone] = (emojis || []).map(
                    (emoji: string, idx: number) =>
                        `${emoji} ${stem}${suffixes[idx % suffixes.length]}`
                );
            }
        }
    }
    return result;
};

export const ko = {
    ...koBase,
    emotions: {
        ...koBase.emotions,
        toddler: buildEmotionToddlerKo(koBase.emotions.emoji),
    },
} as const;

export default ko;
